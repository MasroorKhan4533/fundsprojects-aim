import { useFieldArray, useForm } from "react-hook-form";

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

const CONTACT_TYPES = [
  "DECISION_MAKER",
  "INFLUENCER",
  "TECHNICAL",
  "FINANCE",
  "OPERATIONS",
  "PURCHASE",
  "OTHER",
];

function LeadForm({
  onSubmit,
  users = [],
  isAdmin = false,
}) {
  const {
    register,
    control,
    handleSubmit,
  } = useForm({
    defaultValues: {
      country: "India",
      leadSource: "LINKEDIN",
      businessTypes: "",
      primaryContact: {
        contactType: "DECISION_MAKER",
      },
      additionalContacts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalContacts",
  });

  const submit = (values) => {
    const payload = {
      ...values,
      businessTypes: values.businessTypes
        ? values.businessTypes
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : [],
    };

    [
      "employeeStrength",
      "annualTurnover",
      "estimatedProjectBudget",
    ].forEach((key) => {
      if (payload[key] === "") {
        delete payload[key];
      }
    });

    if (!payload.assignedOwnerId) {
      delete payload.assignedOwnerId;
    }

    onSubmit(payload);
  };

  return (
    <form
      className="aim-form"
      onSubmit={handleSubmit(submit)}
    >
      <h3>Company</h3>

      <div className="form-grid">
        <label>
          Company Name *
          <input
            {...register("companyName", {
              required: true,
            })}
          />
        </label>

        <label>
          Sector *
          <input
            {...register("sector", {
              required: true,
            })}
          />
        </label>

        <label>
          Sub-Sector
          <input {...register("subSector")} />
        </label>

        <label>
          Business Types
          <input
            placeholder="B2B, SaaS"
            {...register("businessTypes")}
          />
        </label>

        <label>
          Website
          <input {...register("website")} />
        </label>

        <label>
          LinkedIn
          <input {...register("linkedinUrl")} />
        </label>

        <label>
          Company Size
          <input {...register("companySize")} />
        </label>

        <label>
          Employees
          <input
            type="number"
            {...register("employeeStrength")}
          />
        </label>

        <label>
          Annual Turnover
          <input
            type="number"
            {...register("annualTurnover")}
          />
        </label>

        <label>
          Country *
          <input
            {...register("country", {
              required: true,
            })}
          />
        </label>

        <label>
          State
          <input {...register("state")} />
        </label>

        <label>
          City
          <input {...register("city")} />
        </label>

        <label>
          Lead Source
          <select {...register("leadSource")}>
            {SOURCES.map((item) => (
              <option key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          Other Source
          <input
            {...register(
              "otherSourceDescription"
            )}
          />
        </label>

        <label>
          Estimated Budget
          <input
            type="number"
            {...register(
              "estimatedProjectBudget"
            )}
          />
        </label>

        {isAdmin && (
          <label>
            Assigned Owner
            <select
              {...register("assignedOwnerId")}
            >
              <option value="">
                Assign to me
              </option>

              {users.map((user) => (
                <option
                  value={user.id}
                  key={user.id}
                >
                  {user.fullName}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label>
        Company Overview
        <textarea
          {...register("companyOverview")}
        />
      </label>

      <label>
        Pain Points
        <textarea
          {...register("painPoints")}
        />
      </label>

      <label>
        Research Notes
        <textarea
          {...register("researchNotes")}
        />
      </label>

      <h3>Primary Contact</h3>

      <div className="form-grid">
        <label>
          Name *
          <input
            {...register(
              "primaryContact.fullName",
              { required: true }
            )}
          />
        </label>

        <label>
          Designation
          <input
            {...register(
              "primaryContact.designation"
            )}
          />
        </label>

        <label>
          Email
          <input
            {...register(
              "primaryContact.email"
            )}
          />
        </label>

        <label>
          Mobile
          <input
            {...register(
              "primaryContact.mobile"
            )}
          />
        </label>

        <label>
          WhatsApp
          <input
            {...register(
              "primaryContact.whatsapp"
            )}
          />
        </label>

        <label>
          Contact Type
          <select
            {...register(
              "primaryContact.contactType"
            )}
          >
            {CONTACT_TYPES.map((item) => (
              <option key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="section-heading">
        <h3>Additional Contacts</h3>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            append({
              fullName: "",
              contactType: "OTHER",
            })
          }
        >
          + Contact
        </button>
      </div>

      {fields.map((field, index) => (
        <div
          className="contact-row"
          key={field.id}
        >
          <input
            placeholder="Name"
            {...register(
              `additionalContacts.${index}.fullName`
            )}
          />

          <input
            placeholder="Designation"
            {...register(
              `additionalContacts.${index}.designation`
            )}
          />

          <input
            placeholder="Email"
            {...register(
              `additionalContacts.${index}.email`
            )}
          />

          <input
            placeholder="Mobile"
            {...register(
              `additionalContacts.${index}.mobile`
            )}
          />

          <select
            {...register(
              `additionalContacts.${index}.contactType`
            )}
          >
            {CONTACT_TYPES.map((item) => (
              <option key={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="danger-button"
            onClick={() => remove(index)}
          >
            Remove
          </button>
        </div>
      ))}

      <button className="primary-button">
        Save Lead
      </button>
    </form>
  );
}

export default LeadForm;
