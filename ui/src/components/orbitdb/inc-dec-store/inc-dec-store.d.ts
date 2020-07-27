declare module "inc-dec-store" {
  import StoreCounter from 'orbit-db-counterstore'

  export default class IncDecStore extends StoreCounter {
      static type: any;
      dec(value?: number): Promise<string>;
  }
}