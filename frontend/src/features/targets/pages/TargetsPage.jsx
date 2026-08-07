import { useForm } from "react-hook-form";

import { useAuth } from "../../auth/hooks/useAuth";
import { useUsers } from "../../users/hooks/useUsers";

import {
  useDeleteTarget,
  useSaveTarget,
  useTargets,
} from "../hooks/useTargets";

function TargetsPage() {
  const auth =
    useAuth();

  const isAdmin =
    auth.data?.user?.role ===
    "ADMIN";

  const users =
    useUsers(isAdmin);

  const targets =
    useTargets();

  const save =
    useSaveTarget();

  const remove =
    useDeleteTarget();

  const form =
    useForm({
      defaultValues: {
        targetDate:
          new Date()
            .toISOString()
            .slice(0, 10),

        leadsTarget: 10,
        callsTarget: 20,
        meetingsTarget: 2,
        followUpsTarget: 10,
        proposalsTarget: 2,
        closuresTarget: 1,
      },
    });

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>
            Daily Targets
          </h1>

          <p>
            Target versus actual
            activity
          </p>
        </div>
      </div>

      {isAdmin && (
        <div className="panel">
          <form
            className="aim-form"
            onSubmit={form.handleSubmit(
              async (
                values
              ) => {
                await save.mutateAsync(
                  values
                );

                alert(
                  "Target saved"
                );
              }
            )}
          >
            <div className="form-grid">
              <label>
                Team Member

                <select
                  {...form.register(
                    "userId",
                    {
                      required:
                        true,
                    }
                  )}
                >
                  <option value="">
                    Select
                  </option>

                  {(users.data?.users ||
                    []).map(
                    (
                      user
                    ) => (
                      <option
                        key={
                          user.id
                        }
                        value={
                          user.id
                        }
                      >
                        {
                          user.fullName
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Date
                <input
                  type="date"
                  {...form.register(
                    "targetDate"
                  )}
                />
              </label>

              <label>
                Leads
                <input
                  type="number"
                  {...form.register(
                    "leadsTarget"
                  )}
                />
              </label>

              <label>
                Calls
                <input
                  type="number"
                  {...form.register(
                    "callsTarget"
                  )}
                />
              </label>

              <label>
                Meetings
                <input
                  type="number"
                  {...form.register(
                    "meetingsTarget"
                  )}
                />
              </label>

              <label>
                Follow-ups
                <input
                  type="number"
                  {...form.register(
                    "followUpsTarget"
                  )}
                />
              </label>

              <label>
                Proposals
                <input
                  type="number"
                  {...form.register(
                    "proposalsTarget"
                  )}
                />
              </label>

              <label>
                Closures
                <input
                  type="number"
                  {...form.register(
                    "closuresTarget"
                  )}
                />
              </label>
            </div>

            <label>
              Notes
              <textarea
                {...form.register(
                  "notes"
                )}
              />
            </label>

            <button className="primary-button">
              Save Target
            </button>
          </form>
        </div>
      )}

      <div className="table-wrap">
        <table className="aim-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Leads</th>
              <th>Calls</th>
              <th>Meetings</th>
              <th>Follow-ups</th>
              <th>Proposals</th>
              <th>Closures</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {(targets.data
              ?.targets ||
              []).map(
              (item) => (
                <tr
                  key={
                    item.id
                  }
                >
                  <td>
                    {
                      item.targetDate
                    }
                  </td>

                  <td>
                    {
                      item.user
                        ?.fullName
                    }
                  </td>

                  <td>
                    {
                      item.actuals
                        ?.leads
                    }
                    /
                    {
                      item.leadsTarget
                    }
                  </td>

                  <td>
                    {
                      item.actuals
                        ?.calls
                    }
                    /
                    {
                      item.callsTarget
                    }
                  </td>

                  <td>
                    {
                      item.actuals
                        ?.meetings
                    }
                    /
                    {
                      item.meetingsTarget
                    }
                  </td>

                  <td>
                    {
                      item.actuals
                        ?.followUps
                    }
                    /
                    {
                      item.followUpsTarget
                    }
                  </td>

                  <td>
                    {
                      item.actuals
                        ?.proposals
                    }
                    /
                    {
                      item.proposalsTarget
                    }
                  </td>

                  <td>
                    {
                      item.actuals
                        ?.closures
                    }
                    /
                    {
                      item.closuresTarget
                    }
                  </td>

                  <td>
                    {isAdmin && (
                      <button
                        className="danger-button"
                        onClick={() =>
                          remove.mutate(
                            item.id
                          )
                        }
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TargetsPage;
