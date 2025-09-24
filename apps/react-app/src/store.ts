import { configureStore, createSlice } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { call, put, takeLatest } from 'redux-saga/effects'
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL_NODE || 'http://localhost:5002'

export type Product = {
  id:number; sku:string; name:string; price:number;
  isActive:boolean; createdAt:string; updatedAt:string
}

const slice = createSlice({
  name: 'products',
  initialState: { items: [] as Product[], loading: false, error: null as any },
  reducers: {
    // read
    fetch: (s) => { (s as any).loading = true },
    set: (s, a) => { (s as any).loading = false; (s as any).items = a.payload },
    fail: (s, a) => { (s as any).loading = false; (s as any).error = a.payload },
    // create
    create: (s, _a) => { (s as any).loading = true },
    created: (s, a) => { (s as any).loading = false; (s as any).items = [...(s as any).items, a.payload] },
    // update
    update: (s, _a) => { (s as any).loading = true },
    updated: (s, a) => {
      (s as any).loading = false;
      (s as any).items = (s as any).items.map((p:Product)=> p.id === a.payload.id ? a.payload : p)
    },
    // delete
    remove: (s, _a) => { (s as any).loading = true },
    removed: (s, a) => {
      (s as any).loading = false;
      (s as any).items = (s as any).items.filter((p:Product)=> p.id !== a.payload)
    },
  }
})

function* fetchProducts() {
  try {
    const res = yield call(axios.get, `${apiUrl}/api/products`)
    yield put(slice.actions.set(res.data))
  } catch (err) { yield put(slice.actions.fail(err)) }
}

function* createProduct(action:any) {
  try {
    const res = yield call(axios.post, `${apiUrl}/api/products`, action.payload)
    yield put(slice.actions.created(res.data))
  } catch (err) { yield put(slice.actions.fail(err)) }
}

function* updateProduct(action:any) {
  try {
    const { id, body } = action.payload
    const res = yield call(axios.put, `${apiUrl}/api/products/${id}`, body)
    yield put(slice.actions.updated(res.data))
  } catch (err) { yield put(slice.actions.fail(err)) }
}

function* deleteProduct(action:any) {
  try {
    const id = action.payload
    yield call(axios.delete, `${apiUrl}/api/products/${id}`)
    yield put(slice.actions.removed(id))
  } catch (err) { yield put(slice.actions.fail(err)) }
}

function* rootSaga() {
  yield takeLatest(slice.actions.fetch.type, fetchProducts)
  yield takeLatest(slice.actions.create.type, createProduct)
  yield takeLatest(slice.actions.update.type, updateProduct)
  yield takeLatest(slice.actions.remove.type, deleteProduct)
}

const saga = createSagaMiddleware()
export const store = configureStore({ reducer: { products: slice.reducer }, middleware: (g)=>g().concat(saga) })
saga.run(rootSaga)

export const actions = slice.actions
