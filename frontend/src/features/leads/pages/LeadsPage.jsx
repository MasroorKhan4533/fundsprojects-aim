import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../auth/hooks/useAuth";
import { useUsers } from "../../users/hooks/useUsers";

import LeadForm from "../components/LeadForm";

import {
  useCreateLead,
  useDeletedLeads,
  useDuplicateCheck,
  useLeads,
  useRestoreLead,
} from "../hooks/useLeads";

const SOURCES = [
  "LINKEDIN",
  "REFERRAL",
  "WEBSITE",
  "COLD_CALL",
  "EVENT",
  "APOLLO",
  "GOOGLE",
  "UPWORK",
  "FIVERR",
  "ADVERTISEMENT",
  "EXISTING_DATABASE",
  "PARTNER",
  "OTHER",
];

function LeadsPage() {
  const auth = useAuth();

  const isAdmin =
    auth.data?.user?.role === "ADMIN";

  const users = useUsers(isAdmin);

  const [createOpen, setCreateOpen] =
    useState(false);

  const [deletedMode, setDeletedMode] =
    useState(false);

  const [filters, setFilters] =
    useState({
      search: "",
      assignedOwnerId: "",
      stage: "",
      temperature: "",
      verificationStatus: "",
      potentialStatus: "",
      sector: "",
      country: "",
      state: "",
      city: "",
      leadSource: "",
      minBudget: "",
      maxBudget: "",
    });

  const leads = useLeads(filters);

  const deleted = useDeletedLeads(
    isAdmin && deletedMode
  );

  const createLead = useCreateLead();
  const duplicates = useDuplicateCheck();
  const restore = useRestoreLead();

  const rows = deletedMode
    ? deleted.data?.leads || []
    : leads.data?.leads || [];

  const create = async (payload) => {
    const check =
      await duplicates.mutateAsync({
        companyName:
          payload.companyName,
        website: payload.website,
        email:
          payload.primaryContact?.email,
        mobile:
          payload.primaryContact?.mobile,
      });

    if (
      check.possibleDuplicates?.length &&
      !window.confirm(
        "Possible duplicate found. Continue?"
      )
    ) {
      return;
    }

    await createLead.mutateAsync(payload);

    setCreateOpen(false);
  };

  const change = (key, value) =>
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>A — Master Leads</h1>
          <p>
            Company, contact and lead
            intelligence
          </p>
        </div>

        <div className="page-actions">
          {isAdmin && (
            <button
              className="secondary-button"
              onClick={() =>
                setDeletedMode(
                  (value) => !value
                )
              }
            >
              {deletedMode
                ? "Active Leads"
                : "Deleted Leads"}
            </button>
          )}

          {!deletedMode && (
            <button
              className="primary-button"
              onClick={() =>
                setCreateOpen(
                  (value) => !value
                )
              }
            >
              {createOpen
                ? "Close"
                : "+ New Lead"}
            </button>
          )}
        </div>
      </div>

      {createOpen && (
        <div className="panel">
          <LeadForm
            onSubmit={create}
            users={
              users.data?.users || []
            }
            isAdmin={isAdmin}
          />
        </div>
      )}

      {!deletedMode && (
        <div className="filters">
          <input
            placeholder="Search..."
            value={filters.search}
            onChange={(e) =>
              change(
                "search",
                e.target.value
              )
            }
          />

          {isAdmin && (
            <select
              value={
                filters.assignedOwnerId
              }
              onChange={(e) =>
                change(
                  "assignedOwnerId",
                  e.target.value
                )
              }
            >
              <option value="">
                All Owners
              </option>

              {(users.data?.users || []).map(
                (user) => (
                  <option
                    key={user.id}
                    value={user.id}
                  >
                    {user.fullName}
                  </option>
                )
              )}
            </select>
          )}

          <select
            value={filters.stage}
            onChange={(e) =>
              change(
                "stage",
                e.target.value
              )
            }
          >
            <option value="">
              All Stages
            </option>
            {[
              "C1",
              "C2",
              "C3",
              "C4",
              "WON",
              "LOST",
            ].map((x) => (
              <option key={x}>
                {x}
              </option>
            ))}
          </select>

          <select
            value={
              filters.temperature
            }
            onChange={(e) =>
              change(
                "temperature",
                e.target.value
              )
            }
          >
            <option value="">
              Temperature
            </option>
            {[
              "HOT",
              "WARM",
              "COLD",
            ].map((x) => (
              <option key={x}>
                {x}
              </option>
            ))}
          </select>

          <select
            value={
              filters.verificationStatus
            }
            onChange={(e) =>
              change(
                "verificationStatus",
                e.target.value
              )
            }
          >
            <option value="">
              Reality
            </option>
            {[
              "PENDING",
              "VALID",
              "INVALID",
            ].map((x) => (
              <option key={x}>
                {x}
              </option>
            ))}
          </select>

          <select
            value={
              filters.potentialStatus
            }
            onChange={(e) =>
              change(
                "potentialStatus",
                e.target.value
              )
            }
          >
            <option value="">
              Potential
            </option>
            {[
              "UNSURE",
              "POTENTIAL",
              "NON_POTENTIAL",
            ].map((x) => (
              <option key={x}>
                {x}
              </option>
            ))}
          </select>

          <select
            value={filters.leadSource}
            onChange={(e) =>
              change(
                "leadSource",
                e.target.value
              )
            }
          >
            <option value="">
              Source
            </option>

            {SOURCES.map((x) => (
              <option key={x}>
                {x}
              </option>
            ))}
          </select>

          {[
            ["sector", "Sector"],
            ["country", "Country"],
            ["state", "State"],
            ["city", "City"],
            ["minBudget", "Min Budget"],
            ["maxBudget", "Max Budget"],
          ].map(([key, label]) => (
            <input
              key={key}
              placeholder={label}
              value={filters[key]}
              onChange={(e) =>
                change(
                  key,
                  e.target.value
                )
              }
            />
          ))}
        </div>
      )}

      <div className="table-wrap">
        <table className="aim-table">
          <thead>
            <tr>
              <th>Lead ID</th>
              <th>Company</th>
              <th>Contact</th>
              <th>Sector</th>
              <th>Location</th>
              <th>Owner</th>
              <th>Reality</th>
              <th>Potential</th>
              <th>Temperature</th>
              <th>Stage</th>
              <th>Budget</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((lead) => {
              const contact =
                lead.contacts?.[0];

              return (
                <tr key={lead.id}>
                  <td>
                    {lead.businessId}
                  </td>

                  <td>
                    {lead.companyName}
                  </td>

                  <td>
                    {contact?.fullName ||
                      "-"}
                    <small>
                      {contact?.mobile ||
                        ""}
                    </small>
                  </td>

                  <td>
                    {lead.sector}
                  </td>

                  <td>
                    {[
                      lead.city,
                      lead.state,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </td>

                  <td>
                    {lead.assignedOwner
                      ?.fullName || "-"}
                  </td>

                  <td>
                    {
                      lead.verificationStatus
                    }
                  </td>

                  <td>
                    {
                      lead.potentialStatus
                    }
                  </td>

                  <td>
                    {lead.temperature}
                  </td>

                  <td>
                    {lead.stage}
                  </td>

                  <td>
                    {lead.estimatedProjectBudget ||
                      "-"}
                  </td>

                  <td>
                    {deletedMode ? (
                      <button
                        className="secondary-button"
                        onClick={() =>
                          restore.mutate(
                            lead.id
                          )
                        }
                      >
                        Restore
                      </button>
                    ) : (
                      <Link
                        className="table-link"
                        to={`/leads/${lead.id}`}
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}

            {!rows.length && (
              <tr>
                <td
                  colSpan="12"
                  className="empty-cell"
                >
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default LeadsPage;
