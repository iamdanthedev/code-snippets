using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Nest;
using Nest.Specification.IndicesApi;

namespace ElasticService.Workrequest.Index
{
    public class WorkrequestIndex
    {
        private const string BaseIndexName = "workrequest";
        public const string FreeTextAnalyzer = "free_text_analyzer";
        public const string EdgeNgramTokenizer = "edge_ngram_tokenizer";
        public const string DefaultNormalizer = "default_normalizer";
        public const string FreetextSuffix = "freetext";
        public const string SuggestSuffix = "suggest";

        public string Id { get; set; }
        public bool IsDirect { get; set; }
        public bool IsPublishedInApp { get; set; }

        public IEnumerable<string> ApplicantIds { get; set; }

        public string AreaOfExpertise { get; set; }
        public IEnumerable<string> Specializations { get; set; }

        public string Country { get; set; }
        public string Region { get; set; }
        public string FullAddress { get; set; }

        public IEnumerable<WeekYear> WeeksAsWeekYear { get; set; }

        public IEnumerable<string> Weeks => WeeksAsWeekYear.Select(x => x.ToElasticWeekYearWeek());

        public string Description { get; set; }
        public string Schedule { get; set; }
        public string Qualification { get; set; }
        public string Profession { get; set; }

        public IEnumerable<string> CustomerGroups { get; set; }
        public IEnumerable<string> BookmarkedByUserIds { get; set; }

        public string WorkplaceId { get; set; }
        public string WorkplaceName { get; set; }
        public string WorkplaceFullAddress { get; set; }
        public string WorkplaceShortAddress { get; set; }

        public string DepartmentId { get; set; }
        public string DepartmentName { get; set; }

        public static string IndexName(string envName)
        {
            return $"{BaseIndexName}_{envName.ToLower()}";
        }
    }

    public static class WorkrequestIndexExtension
    {
        public static async Task<CreateIndexResponse> CreateWorkrequestIndex(this IndicesNamespace indices,
            string envName)
        {
            return await indices.CreateAsync(WorkrequestIndex.IndexName(envName), c =>
            {
                c.SetWorkrequestIndexSettings();
                c.SetWorkrequestIndexMappings();

                return c;
            });
        }

        public static void SetWorkrequestIndexMappings(this CreateIndexDescriptor desc)
        {
            desc.Map<WorkrequestIndex>(map =>
            {
                map.Dynamic(false); // disable auto fields

                map.Properties(props =>
                {
                    props.Keyword(t => t.Name(x => x.Id));
                    props.Boolean(t => t.Name(x => x.IsDirect));
                    props.Boolean(t => t.Name(x => x.IsPublishedInApp));
                    props.Keyword(t => t.Name(x => x.ApplicantIds));

                    props.Text(t => t.Name(x => x.AreaOfExpertise)
                        .Analyzer("swedish")
                        .Fields(ff => ff.Keyword(k => k.Name("keyword")
                                .IgnoreAbove(256))
                            .Text(f => f.Name(WorkrequestIndex.FreetextSuffix)
                                .Analyzer(WorkrequestIndex.FreeTextAnalyzer))
                            .Completion(f => f.Name(WorkrequestIndex.SuggestSuffix))
                        ));

                    props.Text(t => t.Name(x => x.Specializations)
                        .Analyzer("swedish")
                        .Fields(ff => ff
                            .Keyword(k => k.Name("keyword")
                                .IgnoreAbove(256)
                            )
                            .Text(k => k.Name(WorkrequestIndex.FreetextSuffix)
                                .Analyzer(WorkrequestIndex.FreeTextAnalyzer)
                            )
                            .Completion(f => f.Name(WorkrequestIndex.SuggestSuffix))
                        ));

                    props.Text(t => t.Name(x => x.CustomerGroups)
                        .Analyzer("swedish")
                        .Fields(ff => ff
                            .Keyword(k => k.Name("keyword")
                                .IgnoreAbove(256)
                            )
                            .Text(k => k.Name(WorkrequestIndex.FreetextSuffix)
                                .Analyzer(WorkrequestIndex.FreeTextAnalyzer)
                            )
                            .Completion(f => f.Name(WorkrequestIndex.SuggestSuffix))
                        ));

                    props.Keyword(t => t.Name(x => x.Country));

                    props.Keyword(t => t.Name(x => x.Region)
                        .Fields(ff => ff
                            .Text(k => k.Name(WorkrequestIndex.FreetextSuffix)
                                .Analyzer(WorkrequestIndex.FreeTextAnalyzer))
                            .Completion(f => f.Name(WorkrequestIndex.SuggestSuffix))
                        )
                    );

                    props.Date(t => t.Name(x => x.Weeks)
                        .Format("weekyear_week"));

                    props.Keyword(t => t.Name(x => x.WorkplaceId));
                    props.Text(t => t.Name(x => x.WorkplaceName)
                        .Analyzer("swedish")
                        .Fields(ff => ff
                            .Text(k => k.Name(WorkrequestIndex.FreetextSuffix)
                                .Analyzer(WorkrequestIndex.FreeTextAnalyzer))
                            .Completion(f => f.Name(WorkrequestIndex.SuggestSuffix))
                        ));
                    props.Keyword(t => t.Name(x => x.WorkplaceFullAddress));
                    props.Keyword(t => t.Name(x => x.WorkplaceShortAddress));

                    props.Keyword(t => t.Name(x => x.DepartmentId));
                    props.Text(t => t.Name(x => x.DepartmentName)
                        .Analyzer("swedish")
                        .Fields(ff => ff
                            .Text(k => k.Name(WorkrequestIndex.FreetextSuffix)
                                .Analyzer(WorkrequestIndex.FreeTextAnalyzer))
                            .Completion(f => f.Name(WorkrequestIndex.SuggestSuffix))
                        ));

                    props.Text(t => t.Name(x => x.FullAddress)
                        .Analyzer("swedish")
                        .Fields(ff => ff
                            .Text(k => k.Name(WorkrequestIndex.FreetextSuffix)
                                .Analyzer(WorkrequestIndex.FreeTextAnalyzer))
                            .Completion(f => f.Name(WorkrequestIndex.SuggestSuffix))
                        ));

                    props.Text(t => t.Name(x => x.Description)
                        .Analyzer("swedish")
                        .Fields(ff => ff.Text(k => k.Name(WorkrequestIndex.FreetextSuffix)
                            .Analyzer(WorkrequestIndex.FreeTextAnalyzer))));

                    props.Text(t => t.Name(x => x.Schedule)
                        .Analyzer("swedish")
                        .Fields(ff => ff.Text(k => k.Name(WorkrequestIndex.FreetextSuffix)
                            .Analyzer(WorkrequestIndex.FreeTextAnalyzer))));

                    props.Text(t => t.Name(x => x.Qualification)
                        .Analyzer("swedish")
                        .Fields(ff => ff.Text(k => k.Name(WorkrequestIndex.FreetextSuffix)
                            .Analyzer(WorkrequestIndex.FreeTextAnalyzer))));

                    props.Keyword(t => t.Name(x => x.BookmarkedByUserIds));

                    props.Text(t => t.Name(x => x.Profession)
                        .Analyzer("swedish")
                        .Fields(ff => ff.Keyword(k => k.Name("keyword")
                                .IgnoreAbove(256))
                            .Text(f => f.Name(WorkrequestIndex.FreetextSuffix)
                                .Analyzer(WorkrequestIndex.FreeTextAnalyzer))
                            .Completion(f => f.Name(WorkrequestIndex.SuggestSuffix))
                        ));

                    return props;
                });


                return map;
            });
        }

        public static void SetWorkrequestIndexSettings(this CreateIndexDescriptor desc)
        {
            desc.Settings(s => s.Analysis(an =>
            {
                an.Normalizers(normalizers =>
                {
                    normalizers.Custom(WorkrequestIndex.DefaultNormalizer, c =>
                    {
                        c.Filters("lowercase", "scandinavian_normalization", "scandinavian_folding");
                        return c;
                    });


                    return normalizers;
                });

                an.Analyzers(analyzers =>
                {
                    analyzers.Custom(WorkrequestIndex.FreeTextAnalyzer, c =>
                    {
                        c.Tokenizer(WorkrequestIndex.EdgeNgramTokenizer);
                        c.Filters("lowercase", "scandinavian_normalization", "scandinavian_folding");
                        return c;
                    });

                    return analyzers;
                });

                an.Tokenizers(tokenizers =>
                {
                    tokenizers.EdgeNGram(WorkrequestIndex.EdgeNgramTokenizer, ngram => ngram.MinGram(2)
                        .MaxGram(20)
                        .TokenChars(TokenChar.Letter, TokenChar.Digit, TokenChar.Whitespace));

                    return tokenizers;
                });


                return an;
            }));
        }
    }

    public class WeekYear
    {
        public int Year { get; }
        public int Week { get; }

        public WeekYear(int year, int week)
        {
            Year = year;
            Week = week;
        }

        public string ToElasticWeekYearWeek()
        {
            return $"{Year}-W{Week:00}";
        }
    }
}
