import {
  useCreateHandover,
  useHandovers,
  useUpdateHandover,
} from "../hooks/useHandovers";

import { useWonDeals } from "../../c4/hooks/useC4";

function HandoverPage() {
  const handovers =
    useHandovers();

  const won =
    useWonDeals();

  const create =
    useCreateHandover();

  const update =
    useUpdateHandover();

  const existingIds =
    new Set(
      (
        handovers.data
          ?.handovers ||
        []
      ).map(
        (item) =>
          item.leadId
      )
    );

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>
            BUILD Handover
          </h1>

          <p>
            Internal handover
            after successful
            sales closure
          </p>
        </div>
      </div>

      <div className="panel">
        <h2>
          Won Deals Ready
          for Handover
        </h2>

        {(won.data?.leads ||
          [])
          .filter(
            (lead) =>
              !existingIds.has(
                lead.id
              )
          )
          .map(
            (lead) => (
              <div
                className="record-row"
                key={
                  lead.id
                }
              >
                <div>
                  <strong>
                    {
                      lead.companyName
                    }
                  </strong>

                  <span>
                    {
                      lead.businessId
                    }
                  </span>
                </div>

                <button
                  className="primary-button"
                  onClick={() =>
                    create.mutate(
                      lead.id
                    )
                  }
                >
                  Create
                  Handover
                </button>
              </div>
            )
          )}
      </div>

      <div className="panel">
        <h2>
          Handover Register
        </h2>

        {(handovers.data
          ?.handovers ||
          []).map(
          (item) => (
            <div
              className="record-row"
              key={
                item.id
              }
            >
              <div>
                <strong>
                  {
                    item.handoverCode
                  }
                  {" · "}
                  {
                    item.clientName
                  }
                </strong>

                <span>
                  {
                    item.projectName
                  }
                </span>

                <span>
                  {
                    item.handoverStatus
                  }
                </span>
              </div>

              <div>
                {item.handoverStatus ===
                  "DRAFT" && (
                  <button
                    className="secondary-button"
                    onClick={() =>
                      update.mutate({
                        id:
                          item.id,

                        body: {
                          handoverStatus:
                            "READY",
                        },
                      })
                    }
                  >
                    Mark Ready
                  </button>
                )}

                {item.handoverStatus ===
                  "READY" && (
                  <button
                    className="primary-button"
                    onClick={() =>
                      update.mutate({
                        id:
                          item.id,

                        body: {
                          handoverStatus:
                            "HANDED_OVER",
                        },
                      })
                    }
                  >
                    Complete
                    Handover
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

export default HandoverPage;
