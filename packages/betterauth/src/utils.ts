import type { DodoPayments } from "dodopayments";
import type { User } from "better-auth";

export async function getOrCreateCustomerId(
  dodopayments: DodoPayments,
  session: { user: { id: string; email: string; name: string } & Record<string, unknown> },
  internalAdapter: { updateUser: (id: string, data: Record<string, unknown>) => Promise<unknown> },
  getCustomerParams?: (user: User) => { metadata?: Record<string, string>; phone_number?: string | null } | Promise<{ metadata?: Record<string, string>; phone_number?: string | null }>,
): Promise<string> {
  const dodoCustomerId = session.user["dodoCustomerId"] as string | undefined;
  if (dodoCustomerId) return dodoCustomerId;

  // Fallback to get customer from email if dodoCustomerId doesn't exist
  const customers = await dodopayments.customers.list({
    email: session.user.email,
  });
  let customer = customers.items[0];

  if (!customer) {
    const additionalParams = getCustomerParams
      ? await getCustomerParams(session.user as User)
      : undefined;

    customer = await dodopayments.customers.create({
      email: session.user.email,
      name: session.user.name,
      metadata: additionalParams?.metadata,
      phone_number: additionalParams?.phone_number,
    }, { idempotencyKey: session.user.id });
  }

  internalAdapter
    .updateUser(session.user.id, { dodoCustomerId: customer.customer_id })
    .catch(() => {});

  return customer.customer_id;
}
