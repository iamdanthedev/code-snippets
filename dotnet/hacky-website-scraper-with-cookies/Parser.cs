using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Bonliva.PersonNumber;
using HospService.Utils;
using Microsoft.Extensions.Logging;

namespace HospService.Service.SocialStyrelsen
{
    public class SocialStyrelsenWorker
    {
        private readonly Func<string, Task> _dumpCookies;
        private readonly Func<string, string, Task> _dumpPage;
        private readonly List<Cookie> _initialCookies;

        public SocialStyrelsenWorker(
            Func<string, Task> dumpCookies,
            Func<string, string, Task> dumpPage,
            List<Cookie>? initialCookies = null
        )
        {
            _dumpCookies = dumpCookies;
            _dumpPage = dumpPage;
            _initialCookies = initialCookies ?? new List<Cookie>();
        }

        public async Task<List<Document>> Work(string emailBody)
        {
            var emailParser = new SocialStyrelsenEmailParser(emailBody);
            var startUrl = emailParser.ExtractStartPageUrl();

            var downloader = new SocialStyrelsenDownloader(_dumpCookies, _initialCookies, _dumpPage);
            var firstPage = await downloader.GetFirstPage(startUrl);

            await _dumpPage("first_page", firstPage);

            var firstPageParser = new SocialStyrelsenFirstPageParser(firstPage);
            var token = firstPageParser.GetToken();

            if (string.IsNullOrEmpty(token))
            {
                throw new Exception("Empty token");
            }

            var (sessionId, documentDescription) = await downloader.GetDocumentDescription(token);
            var files = await downloader.DownloadDocuments(token, sessionId, documentDescription);

            if (files.Count != documentDescription.Count)
            {
                throw new Exception("the number of files doesn't match");
            }

            return files.Select((x, i) => new Document(documentDescription[i], x))
                .ToList();
        }
    }

    public class SocialStyrelsenDownloader
    {
        private static readonly Uri _base = new Uri("https://secure.socialstyrelsen.se");

        private readonly CookieContainer _cookies;
        private readonly HttpClientHandler _handler;
        private readonly HttpClient _httpClient;
        private readonly Func<string, Task> _dumpCookies;
        private readonly Func<string, string, Task> _dumpPage;

        public SocialStyrelsenDownloader(Func<string, Task> _dumpCookies, Func<string, string, Task> dumpPage) : this(
            _dumpCookies,
            new List<Cookie>(), dumpPage)
        {
        }

        public SocialStyrelsenDownloader(Func<string, Task> _dumpCookies, IEnumerable<Cookie> initialCookies,
            Func<string, string, Task> dumpPage)
        {
            this._dumpCookies = _dumpCookies;
            _dumpPage = dumpPage;
            _cookies = new CookieContainer();
            _handler = new HttpClientHandler
            {
                CookieContainer = _cookies,
                UseCookies = true
            };
            _httpClient = new HttpClient(new LoggingHandler(_handler))
            {
                BaseAddress = _base
            };
            initialCookies.ToList()
                .ForEach(cookie => { _cookies.Add(_base, cookie); });
        }

        public async Task<string> GetFirstPage(string url)
        {
            var message = new HttpRequestMessage(HttpMethod.Get, url);
            message.Headers.Add("Cookie", _cookies.GetCookieHeader(_base));

            var response = await _httpClient.SendAsync(message);
            await _dumpCookies(_cookies.GetCookieHeader(_base));
            return await response.Content.ReadAsStringAsync();
        }

        public async Task<(string, List<DocumentDescription>)> GetDocumentDescription(
            string token)
        {
            var content =
                new MultipartFormDataContent("----WebKitFormBoundarysfCrp9XBPqzcqXZp")
                {
                    {
                        new StringContent(token), "\"manual_envelope\""
                    },
                    {
                        new StringContent("1"), "\"confirmed\""
                    },
                    {
                        new StringContent("sv"), "\"lang\""
                    },
                    {
                        new StringContent("Forts"), "\"manual_submit\""
                    }
                };

            var message = new HttpRequestMessage(HttpMethod.Post, "/message.cgi");
            message.Headers.Add("Cookie", _cookies.GetCookieHeader(_base));
            message.Content = content;

            var response = await _httpClient.SendAsync(message);
            await _dumpCookies(_cookies.GetCookieHeader(_base));
            var body = await response.Content.ReadAsStringAsync();
            await _dumpPage("second_page", body);

            var parser = new SocialStyrelsenAttachmentPageParser(body, _dumpPage);
            var sessionId = parser.GetSessionId();
            var documentNames = parser.GetDocumentDescription();

            return (sessionId, documentNames);
        }

        public async Task<List<byte[]>> DownloadDocuments(
            string token,
            string sessionId,
            List<DocumentDescription> documentDescriptions)
        {
            var files = new List<byte[]>();

            foreach (var doc in documentDescriptions)
            {
                var uri = new Uri("https://secure.socialstyrelsen.se/message.cgi");
                var content = new FormUrlEncodedContent(new[]
                {
                    KeyValuePair.Create("charset", "iso-8859-1"),
                    KeyValuePair.Create("envelope", token),
                    KeyValuePair.Create("attid", doc.Id),
                    KeyValuePair.Create("page", "17"),
                    KeyValuePair.Create("SESSION", sessionId)
                });

                var message = new HttpRequestMessage(HttpMethod.Post, uri);
                message.Headers.Add("Cookie", _cookies.GetCookieHeader(_base));
                message.Content = content;

                var response = await _httpClient.SendAsync(message);
                var file = await response.Content.ReadAsByteArrayAsync();
                files.Add(file);
//                DumpFile(doc.Name, file);
            }

            return files;
        }

//        private void DumpFile(string name, byte[] bytes)
//        {
//            File.WriteAllBytes($"/Users/macbook/Desktop/{name}", bytes);
//        }
    }

    public class SocialStyrelsenEmailParser
    {
        private readonly string _content;

        public SocialStyrelsenEmailParser(string content)
        {
            _content = content;
        }

        public string ExtractStartPageUrl()
        {
            // <input type="hidden" name="envelope" value="VAk9lczXBH6vfuQwpyE0KeYMSXTkPAhigaSP2KrhIEME4QVDoWpJbJDi8-yPYXyKsQfhYtuO1Yf1xLvP_6qUiw">
            var re = new Regex("(http.+message.cgi\\?[^\"]+)");

            foreach (Match? match in re.Matches(_content))
            {
                if (match == null)
                    continue;

                return match.Groups?[1]
                    ?.Value ?? "";
            }

            return "";
        }
    }

    public class SocialStyrelsenFirstPageParser
    {
        private readonly string _content;

        public SocialStyrelsenFirstPageParser(string content)
        {
            _content = content;
        }

        public string GetToken()
        {
            var re = new Regex(@"name=""envelope"" value=""([^""]+)""");
            var match = re.Match(_content);
            return match.Groups[1]
                .Value;
        }
    }

    public class SocialStyrelsenAttachmentPageParser
    {
        private readonly string _content;
        private readonly Func<string, string, Task> _dumpPage;

        public SocialStyrelsenAttachmentPageParser(string content, Func<string, string, Task> dumpPage)
        {
            _dumpPage = dumpPage;
            _content = content.Replace("\n", "");
        }

        public List<DocumentDescription> GetDocumentDescription()
        {
            var titles = GetTitles().ToList();
            var attIds = GetAttIds().ToList();

            _dumpPage("titles", string.Join("\n", titles));
            _dumpPage("attIds", string.Join("\n", attIds));

            if (titles.Count != attIds.Count)
            {
                throw new Exception("cannot parse document");
            }


            return titles
                .Select((title, index) => new DocumentDescription(attIds[index], title))
                .ToList();
        }

        public string GetSessionId()
        {
            var re = new Regex(@"name=""session""[^""]+value=""([^""]+)""",
                RegexOptions.IgnoreCase);

            var match = re.Match(_content);

            if (match == null)
            {
                throw new Exception("Cannot find session id");
            }

            return match.Groups[1]
                .Value;
        }

        private List<string> GetTitles()
        {
            var re = new Regex(@"title=""([^""]+\.(pdf|txt|xlsx))""");
            var matches = re.Matches(_content);
            return matches.Select(match => match.Groups[1]
                    .Value)
                .ToList();
        }

        private List<string> GetAttIds()
        {
            var re = new Regex(@"name=""attid""[^""]+value=""([^""]+)""",
                RegexOptions.IgnoreCase);
            var matches = re.Matches(_content);
            return matches.Select(x => x.Groups[1]
                    .Value)
                .ToList();
        }
    }

    public class DocumentDescription
    {
        public string Id { get; }
        public string Name { get; }
        public SwedishPersonNumber? PersonNumber => SwedishPersonNumber.Parse(Name);

        public DocumentDescription(string id, string name)
        {
            Id = id;
            Name = name;
        }
    }

    public class Document : DocumentDescription
    {
        public byte[] Bytes { get; }

        public Document(DocumentDescription desc, byte[] bytes) : base(desc.Id, desc.Name)
        {
            Bytes = bytes;
        }
    }
}
