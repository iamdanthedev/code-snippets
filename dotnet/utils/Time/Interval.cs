using System;
using System.Collections.Generic;
using System.Linq;
using MoreLinq;

namespace Util.Time
{
    /// <summary>
    /// @todo: add tests !!!!!!!!!!!!
    /// </summary>
    public class Interval : IComparable<Interval>
    {
        public Interval(uint start, uint end)
        {
            Start = start;
            End = end;
        }

        public uint Start { get; }
        public uint End { get; }

        public Interval? Intersect(Interval b)
        {
            if (b.Start > End || Start > b.End)
            {
                return null;
            }

            var start = Math.Max(Start, b.Start);
            var end = Math.Min(End, b.End);

            return new Interval(start, end);
        }

        public bool Contains(Interval b)
        {
            return Start <= b.Start && End >= b.End;
        }

        /// <summary>
        ///   get disjoined union within the bounds of this interval
        /// </summary>
        /// <param name="b"></param>
        /// <returns></returns>
        public List<Interval> Disunion(Interval b)
        {
            var intersection = Intersect(b);

            if (intersection == null)
            {
                return new List<Interval>()
                {
                    Clone()
                };
            }

            var vct = new List<uint>()
                {
                    Start, End, intersection.Start, intersection.End
                }.OrderBy(x => x,
                    OrderByDirection.Ascending)
                .ToList();

            var int1 = new Interval(vct[0], vct[1]);
            var int2 = new Interval(vct[1], vct[2]);
            var int3 = new Interval(vct[2], vct[3]);

            var result = new List<Interval>() {int1, int2, int3}
                .Where(x => !x.IsSame(intersection))
                .ToList();
            result.Sort();
            return result;
        }

        private TKey Compare<TKey>(Interval arg)
        {
            throw new NotImplementedException();
        }


        public Interval Clone()
        {
            return new Interval(Start, End);
        }

        public bool IsSame(Interval b)
        {
            return Start == b.Start && End == b.End;
        }

        public int CompareTo(Interval? b)
        {
            if (b == null)
            {
                return -1;
            }

            return Start < b.Start ? -1 : Start == b.Start && End < b.End ? -1 : 1;
        }

        public List<Interval> SubtractMany(List<Interval> intervals)
        {
            var current = new List<Interval>() {Clone()};

            intervals.ForEach(interval => { current = current.SelectMany(x => x.Disunion(interval)).ToList(); });

            return current;
        }
    }
}