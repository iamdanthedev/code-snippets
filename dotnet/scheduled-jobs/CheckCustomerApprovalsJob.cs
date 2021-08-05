using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Threading.Tasks;
using Api.Dtos;
using Api.Helpers;
using Api.Mappers;
using Bonliva.ApiUtils;
using Bonliva.AuthConsumer.Security;
using Domain.Timereport;
using Domain.Timereport.Projection.FullProjection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using NSwag.Annotations;
using Util.Time;
using StatusCodeObjectResult = Api.Helpers.StatusCodeObjectResult;

namespace Api.Controllers.App
{
    [ApiController]
    [Route("api/app/v1/weekSchedule")]
    public class WeekScheduleController : ControllerBase
    {
        private readonly TimereportService _timereportService;
        private readonly AuthenticationContext _context;
        private readonly TimereportScheduleWeekMapper _timereportScheduleWeekMapper;


        public WeekScheduleController(TimereportService timereportService, AuthenticationContext context,
            TimereportScheduleWeekMapper timereportScheduleWeekMapper)
        {
            _timereportService = timereportService;
            _context = context;
            _timereportScheduleWeekMapper = timereportScheduleWeekMapper;
        }

        [HttpGet("{year}/{week}")]
        [Authorize(SecurityPolicy.Consultant)]
        [OpenApiOperation("GetWeekSchedule")]
        [OpenApiTag("ConsultantAppV1")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(200, Type = typeof(TimereportScheduleDto))]
        [ProducesResponseType(400, Type = typeof(ErrorResponse))]
        [ProducesResponseType(500, Type = typeof(ErrorResponse))]
        public async Task<IActionResult> GetWeekSchedule(
            [FromRoute] int year,
            [FromRoute] int week,
            [FromQuery] string? bookingId = null
        )
        {
            try
            {
                WeekYear.AssertWeekYear(week, year);

                var weekYear = new WeekYear(week, year);
                var bookingObjectId = string.IsNullOrEmpty(bookingId) ? (ObjectId?) null : ObjectId.Parse(bookingId);
                var projections = await _timereportService.GetFullProjectionsByWeek(_context.UserId(), weekYear);

                if (bookingObjectId != null)
                {
                    projections = projections.Where(x => x.BookingId.Equals(bookingObjectId));
                }

                projections = projections.Where(x => x.Status != TimereportStatus.Canceled);

                var dto = _timereportScheduleWeekMapper.ConvertToDto(weekYear, projections.ToList());
                return Ok(dto);
            }
            catch (InvalidWeekYearParamsException)
            {
                return new InvalidRequestObjectResult(new InvalidRequestResponse()
                {
                    ArgumentName = "week/year",
                    Description = "must be valid week and year"
                });
            }
            catch (Exception ex)
            {
                return this.Error(ex.Message);
            }
        }

        [HttpGet("{year:int}/{week:int}/full")]
        [Authorize(SecurityPolicy.Consultant)]
        [OpenApiOperation("GetFullWeekSchedule")]
        [OpenApiTag("ConsultantAppV1")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(200, Type = typeof(TimereportScheduleDto))]
        [ProducesResponseType(400, Type = typeof(ErrorResponse))]
        [ProducesResponseType(500, Type = typeof(ErrorResponse))]
        public async Task<IActionResult> GetFullWeekSchedule([FromRoute] int year, [FromRoute] int week)
        {
            try
            {
                WeekYear.AssertWeekYear(week, year);

                var weekYear = new WeekYear(week, year);
                var projections = await _timereportService.GetFullProjectionsByWeek(_context.UserId(), weekYear);
                projections = projections.Where(x => x.Status != TimereportStatus.Canceled);

                var dto = _timereportScheduleWeekMapper.ConvertToDto(weekYear, projections.ToList());
                return Ok(dto);
            }
            catch (InvalidWeekYearParamsException)
            {
                return new InvalidRequestObjectResult(new InvalidRequestResponse()
                {
                    ArgumentName = "week/year",
                    Description = "must be valid week and year"
                });
            }
            catch (Exception ex)
            {
                return this.Error(ex.Message);
            }
        }

        [HttpGet("timereport/{timereportId}")]
        [Authorize(SecurityPolicy.Consultant)]
        [OpenApiOperation("GetWeekScheduleByTimereportId")]
        [OpenApiTag("ConsultantAppV1")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(200, Type = typeof(TimereportScheduleDto))]
        [ProducesResponseType(400, Type = typeof(ErrorResponse))]
        [ProducesResponseType(500, Type = typeof(ErrorResponse))]
        public async Task<IActionResult> GetWeekScheduleByTimereportId([FromRoute] string timereportId)
        {
            try
            {
                var projection = await _timereportService.GetFullProjectionAsync(timereportId);

                if (projection.ConsultantId.ToString() != _context.Id)
                {
                    return this.Error(403, "forbidden", "");
                }

                var dto = _timereportScheduleWeekMapper.ConvertOneToDto(projection);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return this.Error(ex.Message);
            }
        }
    }
}
