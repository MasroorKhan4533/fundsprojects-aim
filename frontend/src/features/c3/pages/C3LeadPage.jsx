import { useEffect } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";

import {
  useC3Lead,
  useC3Outcome,
  useSaveCommercial,
  useSaveSolution,
} from "../hooks/useC3";

/*
  C3 workspace.
  Solution versions and commercial details are stored separately.
*/

function C3LeadPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();

  const query = useC3Lead(leadId);

  const saveSolution = useSaveSolution();
  const saveCommercial = useSaveCommercial();
  const outcome = useC3Outcome();

  const solutionForm = useForm({
    defaultValues: {
      versionNumber: 1,
      status: "DRAFT",
      modules: "",
    },
  });

  const commercialForm = useForm();

  const lead = query.data?.lead;
  const solutions = query.data?.solutions || [];
  const commercial = query.data?.commercial;

  useEffect(() => {
    if (!lead) return;

    commercialForm.reset({
      proposalUrl:
        commercial?.proposalUrl || "",

      quotationUrl:
        commercial?.quotationUrl || "",

      quotationNumber:
        commercial?.quotationNumber || "",

      proposalAmount:
        commercial?.proposalAmount || "",

      quotationAmount:
        commercial?.quotationAmount || "",

      currency:
        commercial?.currency || "INR",

      probabilityPercent:
        commercial?.probabilityPercent ?? 50,

      negotiationNotes:
        commercial?.negotiationNotes || "",

      commercialStatus:
        commercial?.commercialStatus || "DRAFT",
    });
  }, [lead, commercial, commercialForm]);

  if (query.isLoading) return <p>Loading C3...</p>;

  if (!lead) return <p>Lead not found.</p>;

  const submitSolution = async (values) => {
    const body = {
      ...values,

      versionNumber:
        Number(values.versionNumber),

      modules:
        values.modules
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
    };

    await saveSolution.mutateAsync({
      leadId,
      body,
    });

    solutionForm.reset({
      versionNumber: solutions.length + 2,
      status: "DRAFT",
      modules: "",
    });
  };

  const submitCommercial = async (values) => {
    const body = { ...values };

    for (const key of [
      "proposalAmount",
      "quotationAmount",
      "probabilityPercent",
    ]) {
      if (body[key] === "") {
        delete body[key];
      }
    }

    await saveCommercial.mutateAsync({
      leadId,
      body,
    });

    alert("Commercial details saved");
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

    if (value === "MOVE_TO_C4") {
      navigate("/c4");
    }

    if (value === "LOST") {
      navigate("/leads");
    }
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <Link className="table-link" to="/c3">
            ← C3 Leads
          </Link>

          <h1>{lead.companyName}</h1>

          <p>
            {lead.businessId} · C3 Solution & Commercial
          </p>
        </div>
      </div>

      <div className="panel">
        <h2>Solution Versions</h2>

        {solutions.map((solution) => (
          <div className="record-row" key={solution.id}>
            <div>
              <strong>
                {solution.versionLabel} · {solution.status}
              </strong>

              <span>
                {solution.solutionSummary || "-"}
              </span>

              <span>
                Modules: {(solution.modules || []).join(", ")}
              </span>
            </div>
          </div>
        ))}

        {!solutions.length && (
          <p>No solution version created yet.</p>
        )}

        <form
          className="aim-form"
          onSubmit={solutionForm.handleSubmit(
            submitSolution
          )}
        >
          <div className="form-grid">
            <label>
              Version Number
              <input
                type="number"
                min="1"
                {...solutionForm.register(
                  "versionNumber"
                )}
              />
            </label>

            <label>
              Status
              <select
                {...solutionForm.register("status")}
              >
                {[
                  "DRAFT",
                  "SHARED",
                  "REVISED",
                  "APPROVED",
                  "REJECTED",
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Demo URL
              <input
                {...solutionForm.register("demoUrl")}
              />
            </label>

            <label>
              Presentation URL
              <input
                {...solutionForm.register(
                  "presentationUrl"
                )}
              />
            </label>
          </div>

          <label>
            Solution Summary
            <textarea
              {...solutionForm.register(
                "solutionSummary"
              )}
            />
          </label>

          <label>
            Modules
            <textarea
              placeholder="One module per line"
              {...solutionForm.register("modules")}
            />
          </label>

          <label>
            Scope Notes
            <textarea
              {...solutionForm.register("scopeNotes")}
            />
          </label>

          <label>
            Client Feedback
            <textarea
              {...solutionForm.register(
                "clientFeedback"
              )}
            />
          </label>

          <button className="primary-button">
            Save Solution Version
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>Commercial</h2>

        <form
          className="aim-form"
          onSubmit={commercialForm.handleSubmit(
            submitCommercial
          )}
        >
          <div className="form-grid">
            <label>
              Proposal URL
              <input
                {...commercialForm.register(
                  "proposalUrl"
                )}
              />
            </label>

            <label>
              Proposal Amount
              <input
                type="number"
                {...commercialForm.register(
                  "proposalAmount"
                )}
              />
            </label>

            <label>
              Quotation URL
              <input
                {...commercialForm.register(
                  "quotationUrl"
                )}
              />
            </label>

            <label>
              Quotation Number
              <input
                {...commercialForm.register(
                  "quotationNumber"
                )}
              />
            </label>

            <label>
              Quotation Amount
              <input
                type="number"
                {...commercialForm.register(
                  "quotationAmount"
                )}
              />
            </label>

            <label>
              Currency
              <input
                {...commercialForm.register(
                  "currency"
                )}
              />
            </label>

            <label>
              Probability %
              <input
                type="number"
                min="0"
                max="100"
                {...commercialForm.register(
                  "probabilityPercent"
                )}
              />
            </label>

            <label>
              Commercial Status
              <select
                {...commercialForm.register(
                  "commercialStatus"
                )}
              >
                {[
                  "DRAFT",
                  "PROPOSAL_SENT",
                  "QUOTATION_SENT",
                  "NEGOTIATION",
                  "COMMERCIAL_AGREED",
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Negotiation Notes
            <textarea
              {...commercialForm.register(
                "negotiationNotes"
              )}
            />
          </label>

          <button className="primary-button">
            Save Commercial
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>C3 Outcome</h2>

        <div className="page-actions">
          <button
            className="secondary-button"
            onClick={() => changeStage("CONTINUE")}
          >
            Continue C3
          </button>

          <button
            className="primary-button"
            onClick={() => changeStage("MOVE_TO_C4")}
          >
            Complete C3 → C4
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

export default C3LeadPage;
