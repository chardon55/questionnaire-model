export default interface IUpdateListener<T> {

    onUpdate(oldValue: T, newValue: T): T
}