namespace Framework.Snapshot
{
    public interface ISnapshottable<TSnapshot> where TSnapshot: ISnapshot
    {
        TSnapshot TakeSnapshot();
        
        //void ApplySnapshot(TSnapshot snapshot);
    }
}