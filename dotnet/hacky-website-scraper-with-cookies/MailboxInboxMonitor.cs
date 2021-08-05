using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Bonliva.ConfigurationAutoBinder;
using Bonliva.EmailServiceClient;
using Bonliva.JobScheduler;
using ConsultantServiceClient.Model;
using HospService.Integration;
using HospService.Mailbox;
using HospService.Mongo;
using HospService.Report;
using HospService.Service.ConsultantService;
using HospService.Service.EmailService;
using HospService.Service.SocialStyrelsen;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Document = HospService.Service.SocialStyrelsen.Document;

namespace HospService.Jobs
{
    [AutoBindConfiguration(ConfigRoot = "InboxMonitor")]
    public class InboxMonitorJobOptions
    {
        public string HospMailbox { get; set; }
        public string? Cookies { get; set; }
        public IEnumerable<string> ReportAddresses { get; set; }
    }

    public class InboxMonitorJob : Job
    {
        private readonly InboxMonitorJobOptions _options;
        private readonly AzureBlobStorage _azureBlobStorage;
        private readonly MsGraphService _msGraphService;
        private readonly ConsultantService _consultantService;
        private readonly HospMailLogRepository _mailLogRepository;
        private readonly ImportReportFactory _reportFactory;
        private readonly EmailService _emailService;
        private readonly ILogger<InboxMonitorJob> _logger;

        public InboxMonitorJob(ILogger<InboxMonitorJob> logger, MsGraphService msGraphService,
            InboxMonitorJobOptions options, AzureBlobStorage azureBlobStorage,
            HospMailLogRepository mailLogRepository, ConsultantService consultantService,
            ImportReportFactory reportFactory, EmailService emailService
        ) : base(logger)
        {
            _logger = logger;
            _msGraphService = msGraphService;
            _options = options;
            _azureBlobStorage = azureBlobStorage;
            _mailLogRepository = mailLogRepository;
            _consultantService = consultantService;
            _reportFactory = reportFactory;
            _emailService = emailService;
        }

        public override async Task Work()
        {
            _logger.LogInformation($"report addresses: {string.Join(", ", _options.ReportAddresses)}");
            _logger.LogInformation("Inbox monitor job working...");
            var user = await _msGraphService.GetUserByEmailAsync(_options.HospMailbox);
            var mailbox = await HospMailbox.Create(user);

            await user.ProcessMessagesInFolder(mailbox.InboxFolder.DisplayName,
                async message => { await ProcessMessage(message, mailbox); },
                messages =>
                {
                    _logger.LogInformation($"Messages found: {messages.Count}");
                    return Task.CompletedTask;
                }
            );
        }

        private async Task ProcessMessage(Message message, HospMailbox mailbox)
        {
            if (!IsHospEmail(message))
            {
                _logger.LogInformation("not a hosp email, aborting");
                return;
            }

            message = await mailbox.InboxRequestBuilder.MoveMessageAsync(message.Id, mailbox.InProgressFolder.Id);

            // dump email to blobstorage
            // write to database
            // process every consultant
            //    send request to crm
            //    send write to db
            // form result email and send out
            // move mail to mailbox

            var mailLog = new HospMailLog(message.Id, message.Subject, message.ReceivedDateTime!.Value.UtcDateTime);
            var blobPath = mailLog.Id;
            var blobAttPath = $"{mailLog.Id}/attachments";

            try
            {
                _logger.LogInformation($"Processing message {message.Id}");
                _logger.LogInformation($"Log id: ${mailLog.Id}");

                var worker = new SocialStyrelsenWorker(
                    cookiesHeader => DumpCookies(mailLog.Id, cookiesHeader),
                    (pageName, contents) => DumpPage(mailLog.Id, pageName, contents),
                    ParseCookieOption());
                var documents = await worker.Work(message.Body.Content);

                await DumpDocumentNames(blobPath, documents);
                await DumpEmail(blobPath, message);
                await DumpDocuments(blobAttPath, documents);

                documents.ForEach(doc =>
                {
                    mailLog.Documents.Add(new HospMailDocument()
                    {
                        DocumentName = doc.Name,
                        PersonNumber = doc.PersonNumber?.ToCrmString() ?? ""
                    });
                });

                var docsGroupedByConsultantNumber = documents.Where(x => x.PersonNumber != null)
                    .GroupBy(x => x.PersonNumber!.ToCrmString());

                var emptyRecords = documents.Where(x => x.PersonNumber == null);

                foreach (var emptyRecord in emptyRecords)
                {
                    var op = new HospMailOperation("(personnummer saknas)", HospMailOperationResult.Fail, "", "");
                    op.DocumentNames.Add(emptyRecord.Name);
                    op.DocumentPaths.Add($"{blobAttPath}/{emptyRecord.Name}");
                    mailLog.Operations.Add(op);
                }

                foreach (var group in docsGroupedByConsultantNumber)
                {
                    var personNumber = group.Key;
                    var docs = group.ToList();

                    HospMailOperationResult result;
                    var resultDesc = "";
                    var shortResultDesc = "";

                    // send request out try/catch
                    try
                    {
                        var importDocs = docs.Select(x => new HospImportInputDocuments(
                            _azureBlobStorage.GetSas($"{blobAttPath}/{x.Name}", 30)
                                .ToString(),
                            x.Name)).ToList();

                        var importResult =
                            await _consultantService.ImportHospDataAsync(new HospImportInput(personNumber, importDocs));

                        result = importResult.Status == HospImportStatus.Ok
                            ? HospMailOperationResult.Ok
                            : HospMailOperationResult.Fail;
                        resultDesc = importResult.Log;
                        shortResultDesc = importResult.ShortDescription;
                    }
                    catch (Exception e)
                    {
                        result = HospMailOperationResult.Fail;
                        resultDesc = e.Message;
                    }

                    var op = new HospMailOperation(personNumber, result, resultDesc, shortResultDesc);
                    op.DocumentNames.AddRange(docs.Select(x => x.Name));
                    op.DocumentPaths.AddRange(docs.Select(x => $"{blobAttPath}/{x.Name}"));
                    mailLog.Operations.Add(op);
                }

                var fullLogUri = await DumpFullLog(blobPath, mailLog);

                await _mailLogRepository.InsertOne(mailLog);

                var report = await _reportFactory.Render(mailLog, fullLogUri);
                var totalOps = mailLog.Operations.Count;
                var successOps = mailLog.Operations.Count(x => x.Result == HospMailOperationResult.Ok);
                await _emailService.SendAsync(new SendEmailInput()
                {
                    Subject = $"({successOps}/{totalOps}) HOSP documents processed in email <{message.Subject}>",
                    To = _options.ReportAddresses.Select(x => new Bonliva.EmailServiceClient.EmailAddress
                        {
                            Email = x,
                            Name = x
                        })
                        .ToList(),
                    BodyHtml = report
                });

                var hasIssues = totalOps != successOps;
                var folder = hasIssues ? mailbox.ProcessedWithIssuesFolder : mailbox.ProcessedFolder;

                await mailbox.InboxRequestBuilder.SetMessageReadAsync(message.Id, true);
                await mailbox.InboxRequestBuilder.MoveMessageAsync(message.Id, folder.Id);
            }
            catch (Exception e)
            {
                _logger.LogCritical(
                    $"Cannot parse email, id: {message.Id}, subject: {message.Subject}");
                _logger.LogCritical(e.ToString());
                _logger.LogInformation(
                    $"Cannot parse email, id: {message.Id}, subject: {message.Subject}");
                _logger.LogInformation(e.ToString());

                await mailbox.InboxRequestBuilder.SetMessageReadAsync(message.Id, false);
                await mailbox.InboxRequestBuilder.MoveMessageAsync(message.Id, mailbox.FailedFolder.Id);

                var report = await _reportFactory.RenderWithException(mailLog, e);
                await _emailService.SendAsync(new SendEmailInput()
                {
                    Subject = $"(error occurred) HOSP documents processed in: {message.Subject}",
                    To = _options.ReportAddresses.Select(x => new Bonliva.EmailServiceClient.EmailAddress
                        {
                            Email = x,
                            Name = x
                        })
                        .ToList(),
                    BodyHtml = report
                });
            }
        }

        private bool IsHospEmail(Message message)
        {
            return message.Body.Content.Contains("secure.socialstyrelsen.se",
                StringComparison.InvariantCultureIgnoreCase);
        }

        private async Task DumpCookies(string dir, string cookiesHeader)
        {
            _logger.LogInformation($"cookies: `{cookiesHeader}`");
            var path = $"{dir}/cookies_{Guid.NewGuid()}.txt";
            var bytes = Encoding.UTF8.GetBytes(cookiesHeader);
            await _azureBlobStorage.UploadBytes(path, bytes);
        }

        private async Task DumpDocumentNames(string dir, IEnumerable<Document> documents)
        {
            var content = string.Join("\n", documents.Select(x => x.Name)
                .ToArray());
            var bytes = Encoding.UTF8.GetBytes(content);
            var blobName = $"{dir}/documentNames.txt";
            await _azureBlobStorage.UploadBytes(blobName, bytes);
        }

        private async Task DumpDocuments(string dir, IEnumerable<Document> documents)
        {
            foreach (var document in documents)
            {
                _logger.LogInformation($"uploading document {document.Name}...");
                var blobName = $"{dir}/{document.Name}";
                await _azureBlobStorage.UploadBytes(blobName, document.Bytes);
            }
        }

        private async Task DumpEmail(string dir, Message message)
        {
            var bytes = Encoding.UTF8.GetBytes(message.Body.Content);
            var blobName = $"{dir}/body.html";
            await _azureBlobStorage.UploadBytes(blobName, bytes);
        }

        private async Task DumpPage(string dir, string pageName, string contents)
        {
            var bytes = Encoding.UTF8.GetBytes(contents);
            var blobName = $"{dir}/{pageName}.txt";
            await _azureBlobStorage.UploadBytes(blobName, bytes);
        }

        private async Task<Uri> DumpFullLog(string dir, HospMailLog log)
        {
            var builder = new StringBuilder();

            builder.AppendLine($"Log entry id: {log.Id}");
            builder.AppendLine($"Email subject: {log.Subject}");
            builder.AppendLine($"Email date: {log.EmailDateUtc:f}");
            builder.AppendLine("");
            builder.AppendLine("Operations:");
            builder.AppendLine("");

            log.Operations.ForEach(op =>
            {
                builder.AppendLine($"Personnummer: {op.PersonNumber}");
                builder.AppendLine($"Status: {op.Result.ToString()}");
                builder.AppendLine($"Docs count: {op.DocumentNames.Count}");
                builder.AppendLine($"Desc:\n{op.ResultDescription}");
                builder.AppendLine($"---");
                builder.AppendLine($"files:");

                for (var i = 0; i < op.DocumentNames.Count; i++)
                {
                    var name = op.DocumentNames[i];
                    var url = op.DocumentPaths[i];

                    builder.AppendLine($"{name}: {url}");
                }

                builder.AppendLine("-------------------------------------------");
            });

            var path = $"{dir}/full_log.txt";
            var text = string.Join("\n", builder);
            var bytes = Encoding.UTF8.GetBytes(text);
            await _azureBlobStorage.UploadBytes(path, bytes);
            return _azureBlobStorage.GetSas(path, 30);
        }

        private List<Cookie>? ParseCookieOption()
        {
            if (string.IsNullOrEmpty(_options.Cookies))
            {
                return null;
            }

            return _options.Cookies.Split(";")
                .Select(x =>
                {
                    var elems = x.Split("=")
                        .Select(y => y.Trim())
                        .ToList();

                    return new Cookie(elems[0], elems[1]);
                })
                .ToList();
        }
    }

    public class InboxMonitorJobHostedService : IHostedService
    {
        private readonly InboxMonitorJob _job;

        public InboxMonitorJobHostedService(InboxMonitorJob job)
        {
            _job = job;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            await _job.Work();
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            throw new System.NotImplementedException();
        }
    }
}
