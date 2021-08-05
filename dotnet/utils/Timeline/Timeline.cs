using System;
using System.Collections.Generic;
using System.Linq;
using Util.Time;

namespace Util.Timeline
{
    public delegate T FillCallback<T>(int index);

    public delegate void MatchWithCallback<T, TU>(TimelineUnit<T> unit1, TimelineUnit<TU> unit2, int index);

    public delegate IComparable? GroupByCallback<T>(TimelineUnit<T> unit, int index);


    public class Timeline<T>
    {
        public Timeline(uint start, uint end, uint unitSpanInSeconds)
        {
            Start = start;
            End = end;
            UnitSpanInSeconds = unitSpanInSeconds;
        }

        public uint Start { get; set; }
        public uint End { get; set; }
        public uint UnitSpanInSeconds { get; set; }
        public List<TimelineUnit<T>> Units { get; set; } = new();

        public void Set(int index, T payload)
        {
            Units[index].Payload = payload;
        }

        public T Get(int index)
        {
            return Units[index].Payload;
        }

        public IEnumerable<List<TimelineUnit<T>>> GroupConsecutiveBy(GroupByCallback<T> callback)
        {
            var currentGroup = new List<TimelineUnit<T>>();
            var index = 0;
            var prev = callback(Units[index], index);
            currentGroup.Add(Units[index]);

            index++;

            for (var i = Start + UnitSpanInSeconds; i < End; i += UnitSpanInSeconds)
            {
                var current = callback(Units[index], index);

                if (current == null && !Equals(current, prev))
                {
                    yield return currentGroup;
                    currentGroup = new List<TimelineUnit<T>>();
                }
                else if (current != null && !Equals(current, prev))
                {
                    if (currentGroup.Any())
                        yield return currentGroup;

                    currentGroup = new List<TimelineUnit<T>>();
                    currentGroup.Add(Units[index]);
                }
                else if (current != null && Equals(current, prev))
                {
                    currentGroup.Add(Units[index]);
                }

                prev = current;
                index++;
            }

            if (currentGroup.Any())
                yield return currentGroup;
        }

        public void Fill(FillCallback<T> callback)
        {
            var index = 0;

            for (var i = Start; i <= End; i += UnitSpanInSeconds)
            {
                var unit = new TimelineUnit<T>()
                {
                    Payload = callback(index)
                };

                Units.Insert(index, unit);
                index++;
            }
        }

        public void MatchWith<T2>(Timeline<T2> timeline2, MatchWithCallback<T, T2> callback)
        {
            var index = 0;

            for (var i = Start; i < End; i += UnitSpanInSeconds)
            {
                callback(Units[index], timeline2.Units[index], index);
                index++;
            }
        }

        public List<TimelineUnit<T>> GetUnitsByDateRange(uint from, uint to)
        {
            var length = (to - from) / UnitSpanInSeconds;

            return Slice(from, length);
        }

        public Timeline<TU> Clone<TU>(Func<T, TimelineUnit<TU>> callback)
        {
            return new(Start, End, UnitSpanInSeconds)
            {
                Units = Units.Select(x => callback(x.Payload)).ToList()
            };
        }

        public List<TimelineUnit<T>> Slice(uint fromTimestamp, uint length)
        {
            if (fromTimestamp + length > End)
            {
                throw new IndexOutOfRangeException();
            }

            var from = Convert.ToInt32((fromTimestamp - Start) / UnitSpanInSeconds);

            return Units.Skip(from).Take((int) length).ToList();
        }

        public (uint start, uint end) GetUnitBoundaries(int index)
        {
            return ((uint) index * UnitSpanInSeconds + Start, (uint) (index + 1) * UnitSpanInSeconds + Start);
        }
    }
}