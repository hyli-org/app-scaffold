use std::str;

use anyhow::{anyhow, Result};
use client_sdk::contract_indexer::{
    axum::{extract::State, http::StatusCode, response::IntoResponse, Json, Router},
    utoipa::openapi::OpenApi,
    utoipa_axum::{router::OpenApiRouter, routes},
    AppError, ContractHandler, ContractHandlerStore,
};

use crate::*;
use client_sdk::contract_indexer::axum;
use client_sdk::contract_indexer::utoipa;

impl ContractHandler for Contract2 {
    async fn api(store: ContractHandlerStore<Contract2>) -> (Router<()>, OpenApi) {
        let (router, api) = OpenApiRouter::default()
            .routes(routes!(get_state))
            .split_for_parts();

        (router.with_state(store), api)
    }
}

#[utoipa::path(
    get,
    path = "/state",
    tag = "Contract",
    responses(
        (status = OK, description = "Get json state of contract")
    )
)]
pub async fn get_state(
    State(state): State<ContractHandlerStore<Contract2>>,
) -> Result<impl IntoResponse, AppError> {
    let store = state.read().await;
    store.state.clone().map(Json).ok_or(AppError(
        StatusCode::NOT_FOUND,
        anyhow!("No state found for contract '{}'", store.contract_name),
    ))
}
