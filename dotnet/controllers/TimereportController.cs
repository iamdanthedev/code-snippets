using System;
using System.Net.Mime;
using System.Threading.Tasks;
using Api.Case;
using Api.Dtos;
using Api.Helpers;
using Api.Mappers;
using AutoMapper;
using Bonliva.ApiUtils;
using Bonliva.AuthConsumer.Security;
using Domain.Timereport;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using NSwag.Annotations;
using Util.Time;

namespace Api.Controllers.App
{
    [ApiController]
    [Route("api/app/v1/timereports/{timereportId}")]
    public class TimereportController : ControllerBase
    {
        private readonly AuthenticationContext _context;
        private readonly CreateFreeTimereportCase _createFreeTimereportCase;
        private readonly TimereportService _timereportService;
        private readonly ITimereportTrackingProjectionQuery _trackingProjectionQuery;
        private readonly IMapper _mapper;
        private readonly TimereportTrackingMapper _timereportTrackingMapper;
        private readonly TimereportSummaryMapper _timereportSummaryMapper;

        public TimereportController(CreateFreeTimereportCase createFreeTimereportCase,
            AuthenticationContext context, IMapper mapper, TimereportService timereportService,
            ITimereportTrackingProjectionQuery trackingProjectionQuery,
            TimereportTrackingMapper timereportTrackingMapper, TimereportSummaryMapper timereportSummaryMapper)
        {
            _createFreeTimereportCase = createFreeTimereportCase;
            _context = context;
            _mapper = mapper;
            _timereportService = timereportService;
            _trackingProjectionQuery = trackingProjectionQuery;
            _timereportTrackingMapper = timereportTrackingMapper;
            _timereportSummaryMapper = timereportSummaryMapper;
        }

        [HttpPost("/create")]
        [Authorize(SecurityPolicy.Consultant)]
        [OpenApiOperation("CreateTimereport", "Creates a timereport that is not bound to a booking")]
        [OpenApiTag("ConsultantAppV1")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(200, Type = typeof(TimereportDto))]
        [ProducesResponseType(500, Type = typeof(ErrorResponse))]
        public async Task<IActionResult> CreateTimereport([FromBody] CreateTimereportDto data)
        {
            try
            {
                var date = new WeekYear(data.Week, data.Year).ToUtcDate();
                var projection = await _createFreeTimereportCase.Handle(_context.UserId(), data.WorkplaceName,
                    data.DepartmentName, date);
                var dto = _mapper.Map<TimereportDto>(projection);

                return Ok(dto);
            }
            catch (Exception er)
            {
                return this.Error(er.Message, er.ToString());
            }
        }

        [HttpPost("submit")]
        [Authorize(SecurityPolicy.Consultant)]
        [OpenApiOperation("SubmitTimereport")]
        [OpenApiTag("ConsultantAppV1")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(200, Type = typeof(TimereportDto))]
        [ProducesResponseType(500, Type = typeof(ErrorResponse))]
        public async Task<IActionResult> SubmitTimereport(
            [FromRoute] string timereportId
        )
        {
            try
            {
                var timereportObjectId = ObjectId.Parse(timereportId);
                var timereport = await _timereportService.GetAggregateById(timereportObjectId);

                if (!timereport.ConsultantId.Equals(_context.UserId()))
                {
                    return this.Error("cannot access timereport", "");
                }

                timereport.SubmitByConsultant();
                await _timereportService.SaveAsync(timereport);

                var projection = await _timereportService.GetFullProjectionAsync(timereportObjectId);
                var dto = _mapper.Map<TimereportDto>(projection);

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return this.Error(ex.Message, ex.ToString());
            }
        }

        [HttpGet("tracking")]
        [Authorize(SecurityPolicy.Consultant)]
        [OpenApiOperation("GetTracking")]
        [OpenApiTag("ConsultantAppV1")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(200, Type = typeof(TimereportTrackingDto))]
        [ProducesResponseType(500, Type = typeof(ErrorResponse))]
        public async Task<IActionResult> GetTracking([FromRoute] string timereportId)
        {
            var timereportObjectId = ObjectId.Parse(timereportId);
            var timereport = await _timereportService.GetFullProjectionAsync(timereportObjectId);
            var trackingProjection = await _trackingProjectionQuery.GetByAggregateId(timereportObjectId);

            if (trackingProjection == null)
            {
                return this.Error("cannot find tracking projection", "");
            }

            if (!timereport.ConsultantId.Equals(_context.UserId()))
            {
                return this.Error("cannot access timereport", "");
            }

            var dto = _timereportTrackingMapper.Create(timereport, trackingProjection);

            return Ok(dto);
        }

        [HttpGet("summary")]
        [Authorize(SecurityPolicy.Consultant)]
        [OpenApiOperation("GetSummary")]
        [OpenApiTag("ConsultantAppV1")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(200, Type = typeof(TimereportSummaryDto))]
        [ProducesResponseType(500, Type = typeof(ErrorResponse))]
        public async Task<IActionResult> GetSummary([FromRoute] string timereportId)
        {
            var timereportObjectId = ObjectId.Parse(timereportId);
            var timereportAggregate = await _timereportService.GetAggregateById(timereportObjectId);

            if (timereportAggregate == null)
            {
                return this.Error("cannot find timereport");
            }

            if (!timereportAggregate.ConsultantId.Equals(_context.UserId()))
            {
                return this.Error("cannot access timereport");
            }

            var dto = _timereportSummaryMapper.Create(timereportAggregate);

            return Ok(dto);
        }
    }

    public class CreateTimereportDto
    {
        public int Week { get; set; }
        public int Year { get; set; }
        public string WorkplaceName { get; set; }
        public string DepartmentName { get; set; }
    }
}
