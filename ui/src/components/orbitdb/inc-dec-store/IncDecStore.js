import OrbitDB from "orbit-db"

const TYPE = 'inc_dec_store'

import Store from 'orbit-db-store'
import IncDecIndex from './IncDecIndex'
const Counter = require('crdts/src/PN-Counter')

class IncDecStore extends Store {
  constructor (ipfs, id, dbname, options = {}) {
    if (!options.Index) {
      Object.assign(options, { Index: IncDecIndex })
    }
    super(ipfs, id, dbname, options)
    this._type = TYPE
  }

  static get type () {
    return TYPE
  }

  get value () {
    return this._index.get().value
  }

  newCounter () {
    console.log(this._index.get())
    console.log(this._index._index)
    console.log('this._index.p',this._index.get().p._counters)
    return new Counter(
      this.identity.publicKey,
      Object.assign({}, this._index.get().p._counters),
      Object.assign({}, this._index.get().n._counters)
    )
  }

  inc (amount, options = {}) {
    const counter = this.newCounter()
    console.log('Counter:', counter)
    counter.increment(amount)
    return this._addOperation({
      op: 'INC',
      key: null,
      value: counter.toJSON()
    }, options)
  }

  dec (amount, options = {}) {
    const counter = this.newCounter()
    counter.decrement(amount)
    return this._addOperation({
      op: 'DEC',
      key: null,
      value: counter.toJSON()
    }, options)
  }
}

// add custom type to orbitdb
if (!OrbitDB.isValidType(IncDecStore.type)) {
  OrbitDB.addDatabaseType(IncDecStore.type, IncDecStore)
}

export default IncDecStore