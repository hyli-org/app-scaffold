use client_sdk::transaction_builder::TxExecutorHandler;
use contract1::{Contract1, Contract1Action};
use sdk::{BlobIndex, BlobTransaction, Calldata, Hashed, HyliOutput, TxContext};

#[track_caller]
fn assert_handle<C: TxExecutorHandler>(
    contract: &mut C,
    tx: &BlobTransaction,
    index: BlobIndex,
) -> HyliOutput {
    assert_handle_with_ctx(contract, tx, index, None)
}

#[track_caller]
fn assert_handle_with_ctx<C: TxExecutorHandler>(
    contract: &mut C,
    tx: &BlobTransaction,
    index: BlobIndex,
    tx_ctx: Option<TxContext>,
) -> HyliOutput {
    let calldata = Calldata {
        tx_hash: tx.hashed(),
        identity: tx.identity.clone(),
        blobs: tx.blobs.clone().into(),
        tx_blob_count: tx.blobs.len(),
        index,
        tx_ctx,
        private_input: vec![],
    };

    let handle_result = contract.handle(&calldata);
    assert!(handle_result.is_ok(), "Handle failed: {:#?}", handle_result);
    handle_result.unwrap()
}

#[test]
fn test_contract_lifecycle() {
    let mut contract1 = Contract1::default();

    let tx = BlobTransaction::new(
        sdk::Identity("identityTest".into()),
        vec![Contract1Action::Increment.as_blob("contract1".into())],
    );

    assert_handle(&mut contract1, &tx, BlobIndex(0));

    assert_eq!(contract1.n, 1);

    assert_handle(&mut contract1, &tx, BlobIndex(0));

    assert_eq!(contract1.n, 2);
}
