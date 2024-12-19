import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const { projectUrl, serviceKey } = await request.json();

    if (!projectUrl || !serviceKey) {
      return new Response(JSON.stringify({ message: "Missing credentials" }), {
        status: 400,
      });
    }

    const supabase = createClient(projectUrl, serviceKey);

    const { data: usersData, error: usersError } = await supabase.rpc(
      "get_users_without_mfa"
    );

    if (usersError) {
      throw new Error(
        `Error calling get_users_without_mfa: ${usersError.message}`
      );
    }
    const emails = usersData.map((user) => user.email);
    const mfaAudit = {
      usersWithoutMFA: emails,
      timestamp: new Date().toISOString(),
    };

    const { data: tablesData, error: tablesError } = await supabase.rpc(
      "get_tables_with_rls_disabled"
    );

    if (tablesError) {
      throw new Error(
        `Error calling get_tables_with_rls_disabled: ${tablesError.message}`
      );
    }
    const tablesWithoutRLS = tablesData.map((table) => table.table_name);
    const rlsAudit = {
      tablesWithoutRLS: tablesWithoutRLS,
      timestamp: new Date().toISOString(),
    };

    const { data: pitrStatus, error: pitrStatusError } = await supabase.rpc(
      "is_pitr_enabled"
    );

    if (tablesError) {
      throw new Error(
        `Error calling is_pitr_enable: ${pitrStatusError.message}`
      );
    }

    const pitrAudit = {
      pitrStatus: pitrStatus,
      timestamp: new Date().toISOString(),
    };

    const response = JSON.stringify({
      mfaAudit: mfaAudit,
      rlsAudit: rlsAudit,
      pitrAudit: pitrAudit,
    });

    return new Response(response, {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
    });
  }
}
