import type { Readable } from "svelte/store";

export interface Dispathable<DispatchAction, StoreContents> {
    dispatch(action: DispatchAction): void,
    getStore(): Readable<StoreContents>
}