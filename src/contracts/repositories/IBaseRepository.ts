export default interface IBaseRepo<T> {
    // exists(t: T): Promise<boolean>;
    // getList(query: any): Promise<T[]>;
    // getById(id: Number): Promise<T>;
    // delete(t: T): Promise<any>;
    save(t: T): Promise<T>;
  }