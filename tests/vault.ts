import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import assert from "assert";

describe("vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.vault as Program<Vault>;

  const vaultState = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault_state"), provider.publicKey.toBytes()], program.programId)[0];
  const vault = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault"), vaultState.toBytes()], program.programId)[0];
  let vault_rent_exempt: number;

  it("Is initialized!", async () => {
    const tx = await program.methods
    .initialize()
    .accountsPartial({
      user: provider.publicKey,
      vaultState,
      vault,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
    // console.log("Initialize transaction signature", tx);

    vault_rent_exempt = (await provider.connection.getBalance(vault));
    // console.log("Vault balance is: ", vault_rent_exempt.toString());
  });

  it("Deposit", async () => {
    const amount = new anchor.BN(3.14 * anchor.web3.LAMPORTS_PER_SOL);
    const tx = await program.methods
    .deposit(amount)
    .accountsPartial({
      user: provider.publicKey,
      vaultState,
      vault,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
  });

  it("Withdraw", async () => {
    const amount = new anchor.BN(2.14 * anchor.web3.LAMPORTS_PER_SOL);
    const tx = await program.methods
    .withdraw(amount)
    .accountsPartial({
      user: provider.publicKey,
      vaultState,
      vault,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

    const vault_balance = (await provider.connection.getBalance(vault));
    assert.strictEqual(vault_balance-vault_rent_exempt, 1_000_000_000);
    // console.log("Vault balance", vault_balance.toString());
  });

  it("Close", async () => {
    const tx = await program.methods
    .close()
    .accountsPartial({
      user: provider.publicKey,
      vaultState,
      vault,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
    // console.log("Close transaction signature", tx);
  });
});
