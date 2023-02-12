import pg from "pg";

const {
  Client,
  ClientBase,
  Connection,
  DatabaseError,
  Events,
  Pool,
  Query,
  defaults,
  native,
  types,
} = pg;

interface Client extends pg.Client { }
interface ClientBase extends pg.ClientBase { }
interface Connection extends pg.Connection { }
interface DatabaseError extends pg.DatabaseError { }
interface Events extends pg.Events { }
interface Pool extends pg.Pool { }
interface Query<R extends pg.QueryResultRow = any, I extends any[] = any> extends pg.Query<R, I> { }

export type {
  BindConfig,
  ClientConfig,
  ConnectionConfig,
  CustomTypesConfig,
  Defaults,
  ExecuteConfig,
  FieldDef,
  MessageConfig,
  Notification,
  PoolClient,
  PoolConfig,
  QueryArrayConfig,
  QueryArrayResult,
  QueryConfig,
  QueryParse,
  QueryResult,
  QueryResultBase,
  QueryResultRow,
  ResultBuilder,
  Submittable
} from "pg";
export {
  Client,
  ClientBase,
  Connection,
  DatabaseError,
  Events,
  Pool,
  Query,
  defaults,
  native,
  types,
};

export default pg;
