#!/usr/bin/env bash
cd "./multi-party-ecdsa/"
command cargo build --release --examples --no-default-features --features curv-kzen/num-bigint || fail "Cargo failed"
cd -
cp TeleporterMPC.js SettingsMPC.json ./multi-party-ecdsa/target/release/examples
npm install





