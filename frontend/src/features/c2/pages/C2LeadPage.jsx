import { useEffect } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";

import {
  useC2Lead,
  useC2Outcome,
  useSaveC2,
} from "../hooks/useC2";

/*
  C2 requirement workspace.
*/

const arrayToText = (value = []) =>
  Array.isArray(value) ? value.join("\n") : "";

const textToArray = (value = "") =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

function C2LeadPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();

  const query = useC2Lead(leadId);
  const saveC2 = useSaveC2();
  const outcome = useC2Outcome();

  const form = useForm();

  const lead = query.data?.lead;
  const profile = query.data?.profile;

  useEffect(() => {
    if (!lead) return;

    form.reset({
      currentWorkflow:
        profile?.currentWorkflow || "",

      mustHaveRequirements:
        arrayToText(profile?.mustHaveRequirements),

      goodToHaveRequirements:
        arrayToText(profile?.goodToHaveRequirements),

      excludedRequirements:
        arrayToText(profile?.excludedRequirements),

      requiredReports:
        arrayToText(profile?.requiredReports),

      integrations:
        arrayToText(profile?.integrations),

      demoFeedback:
        profile?.demoFeedback || "",

      businessRequirementSummary:
        profile?.businessRequirementSummary || "",

      brdUrl:
        profile?.brdUrl || "",

      prdUrl:
        profile?.prdUrl || "",

      costingUrl:
        profile?.costingUrl || "",

      status:
        profile?.status || "NOT_STARTED",
    });
  }, [lead, profile, form]);

  if (query.isLoading) return <p>Loading C2...</p>;

  if (!lead) return <p>Lead not found.</p>;

  const save = async (values) => {
    const body = {
      ...values,

      mustHaveRequirements:
        textToArray(values.mustHaveRequirements),

      goodToHaveRequirements:
        textToArray(values.goodToHaveRequirements),

      excludedRequirements:
        textToArray(values.excludedRequirements),

      requiredReports:
        textToArray(values.requiredReports),

      integrations:
        textToArray(values.integrations),
    };

    await saveC2.mutateAsync({
      leadId,
      body,
    });

    alert("C2 requirements saved");
  };

  const changeStage = async (value) => {
    let lossReason;

    if (value === "LOST") {
      lossReason = window.prompt("Enter loss reason:");

      if (!lossReason) return;
    }

    await outcome.mutateAsync({
      leadId,

      body: {
        outcome: value,
        lossReason,
      },
    });

    if (value === "MOVE_TO_C3") {
      navigate("/c3");
    }

    if (value === "LOST") {
      navigate("/leads");
    }
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <Link className="table-link" to="/c2">
            ← C2 Leads
          </Link>

          <h1>{lead.companyName}</h1>

          <p>
            {lead.businessId} · C2 Requirement Clarity
          </p>
        </div>
      </div>

      <div className="panel">
        <form
          className="aim-form"
          onSubmit={form.handleSubmit(save)}
        >
          <label>
            Current Workflow *
            <textarea
              {...form.register("currentWorkflow")}
            />
          </label>

          <div className="form-grid">
            <label>
              Must-Have Requirements *
              <textarea
                placeholder="One requirement per line"
                {...form.register(
                  "mustHaveRequirements"
                )}
              />
            </label>

            <label>
              Good-to-Have Requirements
              <textarea
                placeholder="One requirement per line"
                {...form.register(
                  "goodToHaveRequirements"
                )}
              />
            </label>

            <label>
              Excluded Requirements
              <textarea
                placeholder="One exclusion per line"
                {...form.register(
                  "excludedRequirements"
                )}
              />
            </label>

            <label>
              Required Reports
              <textarea
                placeholder="One report per line"
                {...form.register(
                  "requiredReports"
                )}
              />
            </label>

            <label>
              Integrations
              <textarea
                placeholder="One integration per line"
                {...form.register("integrations")}
              />
            </label>

            <label>
              C2 Status
              <select {...form.register("status")}>
                {[
                  "NOT_STARTED",
                  "IN_PROGRESS",
                  "WAITING_FOR_CLIENT",
                  "READY_FOR_C3",
                  "ON_HOLD",
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Demo Feedback
            <textarea {...form.register("demoFeedback")} />
          </label>

          <label>
            Business Requirement Summary
            <textarea
              {...form.register(
                "businessRequirementSummary"
              )}
            />
          </label>

          <div className="form-grid">
            <label>
              BRD URL
              <input {...form.register("brdUrl")} />
            </label>

            <label>
              PRD URL
              <input {...form.register("prdUrl")} />
            </label>

            <label>
              Costing URL
              <input {...form.register("costingUrl")} />
            </label>
          </div>

          <button className="primary-button">
            Save C2 Requirements
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>C2 Outcome</h2>

        <div className="page-actions">
          <button
            className="secondary-button"
            onClick={() => changeStage("CONTINUE")}
          >
            Continue C2
          </button>

          <button
            className="primary-button"
            onClick={() => changeStage("MOVE_TO_C3")}
          >
            Complete C2 → C3
          </button>

          <button
            className="danger-button"
            onClick={() => changeStage("LOST")}
          >
            Mark Lost
          </button>
        </div>
      </div>
    </section>
  );
}

export default C2LeadPage;
