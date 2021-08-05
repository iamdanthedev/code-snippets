using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Threading.Tasks;
using Api.Dtos;
using AutoMapper;
using Bonliva.ApiUtils;
using Domain.Timereport;
using Domain.Timereport.Aggregate;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using NSwag.Annotations;
using Util.Time;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/internal/v1/timereports")]
    public class FreeTimereportController : ControllerBase
    {
        private readonly TimereportService _timereportService;
        private readonly IMapper _mapper;

        public FreeTimereportController(TimereportService timereportService, IMapper mapper)
        {
            _timereportService = timereportService;
            _mapper = mapper;
        }

        [HttpGet("getFreeTimereports")]
        [OpenApiOperation("GetFreeTimereports")]
        [OpenApiTag("InternalV1")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(200, Type = typeof(IEnumerable<TimereportDto>))]
        [ProducesResponseType(500, Type = typeof(ErrorResponse))]
        public async Task<IActionResult> GetFreeTimereports(
            [FromQuery] string consultantId, [FromQuery] int week, [FromQuery] int year)
        {
            var consultantObjId = ObjectId.Parse(consultantId);

            var items = await _timereportService.GetFullProjectionsByConsultantOnWeek(consultantObjId, week, year);
            var freeItems = items.Where(x => x.BookingId == null);
            var dtos = freeItems.Select(x => _mapper.Map<TimereportDto>(x)).ToList();

            return Ok(dtos);
        }

        [HttpPost("assignToBooking")]
        [OpenApiOperation("AssignToBooking")]
        [OpenApiTag("InternalV1")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(200, Type = typeof(TimereportDto))]
        [ProducesResponseType(500, Type = typeof(ErrorResponse))]
        public async Task<IActionResult> AssignToBooking(string timereportId, string bookingId)
        {
            var timereportObjId = ObjectId.Parse(timereportId);
            var bookingObjId = ObjectId.Parse(bookingId);
            var timereport = await _timereportService.GetAggregateById(timereportObjId);

            if (timereport.BookingId != null)
            {
                return new BadRequestObjectResult(new
                {
                    error = "Timereport already attached"
                });
            }

            var existingWorkplace = "";
            var existingWorkplaceId = "";
            var existingDept = "";
            var existingDeptId = "";

            try
            {
                var existingTimereportProject =
                    await _timereportService.GetFullProjectionByBookingIdAsync(bookingObjId);
                var existingTimereport =
                    await _timereportService.GetAggregateById(existingTimereportProject.AggregateId);
                existingTimereport.UnassignFromBooking();
                await _timereportService.SaveAsync(existingTimereport);

                existingWorkplace = existingTimereport.Workplace;
                existingWorkplaceId = existingTimereport.WorkplaceId;
                existingDept = existingTimereport.Department;
                existingDeptId = existingTimereport.DepartmentId;
            }
            catch (Exception ex)
            {
                return this.Error("Cannot deassign existing timereport", ex.Message);
            }

            timereport.AssignToBooking(bookingObjId, existingWorkplace, existingWorkplaceId, existingDept,
                existingDeptId);
            await _timereportService.SaveAsync(timereport);

            var projection = await _timereportService.GetFullProjectionAsync(timereportObjId);
            var dto = _mapper.Map<TimereportDto>(projection);

            return Ok(dto);
        }
    }
}
