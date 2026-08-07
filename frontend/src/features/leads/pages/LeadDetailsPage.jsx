import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useForm } from "react-hook-form";

import { useAuth } from "../../auth/hooks/useAuth";
import { useUsers } from "../../users/hooks/useUsers";

import {
  useAddComment,
  useAddContact,
  useAssignLead,
  useAudits,
  useDeleteContact,
  useDeleteLead,
  useLead,
  useUpdateContact,
  useUpdateLead,
} from "../hooks/useLeads";

const CONTACT_TYPES = [
  "DECISION_MAKER",
  "INFLUENCER",
  "TECHNICAL",
  "FINANCE",
  "OPERATIONS",
  "PURCHASE",
  "OTHER",
];

function LeadDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const auth = useAuth();

  const isAdmin =
    auth.data?.user?.role === "ADMIN";

  const leadQuery = useLead(id);
  const users = useUsers(isAdmin);
  const audits = useAudits(
    id,
    isAdmin
  );

  const updateLead =
    useUpdateLead();

  const assign =
    useAssignLead();

  const remove =
    useDeleteLead();

  const addComment =
    useAddComment();

  const addContact =
    useAddContact();

  const updateContact =
    useUpdateContact();

  const deleteContact =
    useDeleteContact();

  const editForm = useForm();
  const contactForm = useForm({
    defaultValues: {
      contactType: "OTHER",
    },
  });

  const [
    editingContact,
    setEditingContact,
  ] = useState(null);

  const [comment, setComment] =
    useState("");

  const lead =
    leadQuery.data?.lead;

  useEffect(() => {
    if (!lead) return;

    editForm.reset({
      companyName:
        lead.companyName || "",
      website:
        lead.website || "",
      linkedinUrl:
        lead.linkedinUrl || "",
      sector:
        lead.sector || "",
      subSector:
        lead.subSector || "",
      country:
        lead.country || "",
      state:
        lead.state || "",
      city:
        lead.city || "",
      employeeStrength:
        lead.employeeStrength || "",
      annualTurnover:
        lead.annualTurnover || "",
      estimatedProjectBudget:
        lead.estimatedProjectBudget ||
        "",
      verificationStatus:
        lead.verificationStatus,
      potentialStatus:
        lead.potentialStatus,
      temperature:
        lead.temperature,
      invalidReason:
        lead.invalidReason || "",
      companyOverview:
        lead.companyOverview || "",
      painPoints:
        lead.painPoints || "",
      researchNotes:
        lead.researchNotes || "",
    });
  }, [lead]);

  if (leadQuery.isLoading) {
    return <p>Loading...</p>;
  }

  if (!lead) {
    return <p>Lead not found.</p>;
  }

  const canEdit =
    isAdmin ||
    lead.assignedOwnerId ===
      auth.data?.user?.id;

  const saveLead = async (
    values
  ) => {
    [
      "employeeStrength",
      "annualTurnover",
      "estimatedProjectBudget",
    ].forEach((key) => {
      if (values[key] === "") {
        delete values[key];
      }
    });

    await updateLead.mutateAsync({
      id,
      body: values,
    });
  };

  const saveContact = async (
    values
  ) => {
    if (editingContact) {
      await updateContact.mutateAsync({
        id,
        contactId:
          editingContact.id,
        body: values,
      });
    } else {
      await addContact.mutateAsync({
        id,
        body: values,
      });
    }

    setEditingContact(null);

    contactForm.reset({
      contactType: "OTHER",
    });
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <Link
            className="table-link"
            to="/leads"
          >
            ← Master Leads
          </Link>

          <h1>
            {lead.companyName}
          </h1>

          <p>
            {lead.businessId} ·{" "}
            {lead.stage}
          </p>
        </div>
      </div>

      <div className="panel">
        <h2>
          Lead Information
        </h2>

        <form
          className="aim-form"
          onSubmit={editForm.handleSubmit(
            saveLead
          )}
        >
          <div className="form-grid">
            <label>
              Company
              <input
                disabled={!canEdit}
                {...editForm.register(
                  "companyName"
                )}
              />
            </label>

            <label>
              Sector
              <input
                disabled={!canEdit}
                {...editForm.register(
                  "sector"
                )}
              />
            </label>

            <label>
              Sub-Sector
              <input
                disabled={!canEdit}
                {...editForm.register(
                  "subSector"
                )}
              />
            </label>

            <label>
              Website
              <input
                disabled={!canEdit}
                {...editForm.register(
                  "website"
                )}
              />
            </label>

            <label>
              LinkedIn
              <input
                disabled={!canEdit}
                {...editForm.register(
                  "linkedinUrl"
                )}
              />
            </label>

            <label>
              Country
              <input
                disabled={!canEdit}
                {...editForm.register(
                  "country"
                )}
              />
            </label>

            <label>
              State
              <input
                disabled={!canEdit}
                {...editForm.register(
                  "state"
                )}
              />
            </label>

            <label>
              City
              <input
                disabled={!canEdit}
                {...editForm.register(
                  "city"
                )}
              />
            </label>

            <label>
              Employees
              <input
                type="number"
                disabled={!canEdit}
                {...editForm.register(
                  "employeeStrength"
                )}
              />
            </label>

            <label>
              Turnover
              <input
                type="number"
                disabled={!canEdit}
                {...editForm.register(
                  "annualTurnover"
                )}
              />
            </label>

            <label>
              Budget
              <input
                type="number"
                disabled={!canEdit}
                {...editForm.register(
                  "estimatedProjectBudget"
                )}
              />
            </label>

            <label>
              Reality
              <select
                disabled={!canEdit}
                {...editForm.register(
                  "verificationStatus"
                )}
              >
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
            </label>

            <label>
              Potential
              <select
                disabled={!canEdit}
                {...editForm.register(
                  "potentialStatus"
                )}
              >
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
            </label>

            <label>
              Temperature
              <select
                disabled={!canEdit}
                {...editForm.register(
                  "temperature"
                )}
              >
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
            </label>

            <label>
              Invalid Reason
              <input
                disabled={!canEdit}
                {...editForm.register(
                  "invalidReason"
                )}
              />
            </label>
          </div>

          <label>
            Company Overview
            <textarea
              disabled={!canEdit}
              {...editForm.register(
                "companyOverview"
              )}
            />
          </label>

          <label>
            Pain Points
            <textarea
              disabled={!canEdit}
              {...editForm.register(
                "painPoints"
              )}
            />
          </label>

          <label>
            Research Notes
            <textarea
              disabled={!canEdit}
              {...editForm.register(
                "researchNotes"
              )}
            />
          </label>

          {canEdit && (
            <button className="primary-button">
              Save Changes
            </button>
          )}
        </form>

        {isAdmin && (
          <div className="inline-form">
            <select
              value={
                lead.assignedOwnerId
              }
              onChange={(e) =>
                assign.mutate({
                  id,
                  assignedOwnerId:
                    e.target.value,
                })
              }
            >
              {(users.data?.users ||
                []).map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.fullName}
                </option>
              ))}
            </select>

            <button
              className="danger-button"
              onClick={async () => {
                if (
                  !window.confirm(
                    "Soft delete lead?"
                  )
                ) {
                  return;
                }

                await remove.mutateAsync(
                  id
                );

                navigate("/leads");
              }}
            >
              Delete Lead
            </button>
          </div>
        )}
      </div>

      <div className="panel">
        <h2>Contacts</h2>

        {lead.contacts?.map(
          (contact) => (
            <div
              className="record-row"
              key={contact.id}
            >
              <div>
                <strong>
                  {contact.fullName}
                </strong>

                <span>
                  {contact.designation ||
                    "-"}{" "}
                  ·{" "}
                  {contact.contactType}
                </span>

                <span>
                  {contact.email ||
                    "-"}{" "}
                  ·{" "}
                  {contact.mobile ||
                    "-"}
                </span>
              </div>

              {canEdit && (
                <div>
                  <button
                    className="secondary-button"
                    onClick={() => {
                      setEditingContact(
                        contact
                      );

                      contactForm.reset(
                        contact
                      );
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="danger-button"
                    onClick={() =>
                      deleteContact.mutate({
                        id,
                        contactId:
                          contact.id,
                      })
                    }
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )
        )}

        {canEdit && (
          <form
            className="inline-form wrap"
            onSubmit={contactForm.handleSubmit(
              saveContact
            )}
          >
            <input
              placeholder="Name"
              {...contactForm.register(
                "fullName",
                { required: true }
              )}
            />

            <input
              placeholder="Designation"
              {...contactForm.register(
                "designation"
              )}
            />

            <input
              placeholder="Email"
              {...contactForm.register(
                "email"
              )}
            />

            <input
              placeholder="Mobile"
              {...contactForm.register(
                "mobile"
              )}
            />

            <input
              placeholder="WhatsApp"
              {...contactForm.register(
                "whatsapp"
              )}
            />

            <select
              {...contactForm.register(
                "contactType"
              )}
            >
              {CONTACT_TYPES.map(
                (x) => (
                  <option key={x}>
                    {x}
                  </option>
                )
              )}
            </select>

            <label>
              <input
                type="checkbox"
                {...contactForm.register(
                  "isPrimary"
                )}
              />
              Primary
            </label>

            <button className="primary-button">
              {editingContact
                ? "Update"
                : "Add Contact"}
            </button>
          </form>
        )}
      </div>

      <div className="panel">
        <h2>Comments</h2>

        {canEdit && (
          <div className="inline-form">
            <input
              value={comment}
              placeholder="Internal comment..."
              onChange={(e) =>
                setComment(
                  e.target.value
                )
              }
            />

            <button
              className="primary-button"
              onClick={async () => {
                if (
                  !comment.trim()
                ) {
                  return;
                }

                await addComment.mutateAsync(
                  {
                    id,
                    comment,
                  }
                );

                setComment("");
              }}
            >
              Add
            </button>
          </div>
        )}

        {lead.comments?.map(
          (item) => (
            <div
              className="timeline-item"
              key={item.id}
            >
              <strong>
                {item.author
                  ?.fullName ||
                  "User"}
              </strong>

              <p>
                {item.comment}
              </p>

              <small>
                {new Date(
                  item.createdAt
                ).toLocaleString()}
              </small>
            </div>
          )
        )}
      </div>

      {isAdmin && (
        <div className="panel">
          <h2>
            Audit History
          </h2>

          {(audits.data?.audits ||
            []).map((item) => (
            <div
              className="timeline-item"
              key={item.id}
            >
              <strong>
                {item.action}
              </strong>

              <p>
                {item.fieldName ||
                  ""}
              </p>

              <small>
                {new Date(
                  item.createdAt
                ).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default LeadDetailsPage;
