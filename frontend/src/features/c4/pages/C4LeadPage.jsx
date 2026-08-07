import { useEffect } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";

import {
  useC4Lead,
  useC4Outcome,
  useSaveClosure,
} from "../hooks/useC4";

/*
  C4 closure workspace.
*/

function C4LeadPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();

  const query = useC4Lead(leadId);
  const saveClosure = useSaveClosure();
  const outcome = useC4Outcome();

  const form = useForm();

  const lead = query.data?.lead;
  const closure = query.data?.closure;

  useEffect(() => {
    if (!lead) return;

    form.reset({
      agreementUrl:
        closure?.agreementUrl || "",

      ndaUrl:
        closure?.ndaUrl || "",

      purchaseOrderUrl:
        closure?.purchaseOrderUrl || "",

      purchaseOrderNumber:
        closure?.purchaseOrderNumber || "",

      finalDealValue:
        closure?.finalDealValue || "",

      advanceAmount:
        closure?.advanceAmount || 0,

      paymentStatus:
        closure?.paymentStatus || "NOT_STARTED",

      closureNotes:
        closure?.closureNotes || "",

      status:
        closure?.status || "NEGOTIATING",
    });
  }, [lead, closure, form]);

  if (query.isLoading) return <p>Loading C4...</p>;

  if (!lead) return <p>Lead not found.</p>;

  const save = async (values) => {
    const body = { ...values };

    for (const key of [
      "finalDealValue",
      "advanceAmount",
    ]) {
      if (body[key] === "") {
        delete body[key];
      }
    }

    await saveClosure.mutateAsync({
      leadId,
      body,
    });

    alert("Closure details saved");
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

    if (value === "WON") {
      navigate("/won");
    }

    if (value === "LOST") {
      navigate("/leads");
    }
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <Link className="table-link" to="/c4">
            ← C4 Leads
          </Link>

          <h1>{lead.companyName}</h1>

          <p>
            {lead.businessId} · C4 Closure
          </p>
        </div>
      </div>

      <div className="panel">
        <form
          className="aim-form"
          onSubmit={form.handleSubmit(save)}
        >
          <div className="form-grid">
            <label>
              Agreement URL
              <input {...form.register("agreementUrl")} />
            </label>

            <label>
              NDA URL
              <input {...form.register("ndaUrl")} />
            </label>

            <label>
              Purchase Order URL
              <input
                {...form.register("purchaseOrderUrl")}
              />
            </label>

            <label>
              Purchase Order Number *
              <input
                {...form.register(
                  "purchaseOrderNumber"
                )}
              />
            </label>

            <label>
              Final Deal Value *
              <input
                type="number"
                {...form.register("finalDealValue")}
              />
            </label>

            <label>
              Advance Amount
              <input
                type="number"
                {...form.register("advanceAmount")}
              />
            </label>

            <label>
              Payment Status
              <select
                {...form.register("paymentStatus")}
              >
                {[
                  "NOT_STARTED",
                  "ADVANCE_PENDING",
                  "ADVANCE_RECEIVED",
                  "PARTIALLY_PAID",
                  "PAID",
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Closure Status
              <select {...form.register("status")}>
                {[
                  "NEGOTIATING",
                  "DOCUMENTATION",
                  "READY_TO_CLOSE",
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Closure Notes
            <textarea
              {...form.register("closureNotes")}
            />
          </label>

          <button className="primary-button">
            Save C4 Closure
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>C4 Outcome</h2>

        <div className="page-actions">
          <button
            className="secondary-button"
            onClick={() => changeStage("CONTINUE")}
          >
            Continue C4
          </button>

          <button
            className="primary-button"
            onClick={() => changeStage("WON")}
          >
            Mark Deal WON
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

export default C4LeadPage;
