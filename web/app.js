// Browser-only version - no Node.js requires

document.addEventListener("DOMContentLoaded", () => {
  const documentInput = document.getElementById("documentInput");
  const uploadButton = document.getElementById("uploadButton");
  const sampleButton = document.getElementById("sampleButton");
  const obligationsList = document.getElementById("obligationsList");
  const summaryOutput = document.getElementById("summaryOutput");
  const errorMessage = document.getElementById("errorMessage");

  const SAMPLE_TEXT = `You shall report to your supervising officer as directed.
You shall notify your supervising officer within 72 hours of any change in residence or employment.
You shall not leave the judicial district without permission.
You shall refrain from any unlawful use of a controlled substance.
You shall participate in a substance abuse treatment program as directed.`;

  function setLoading(label) {
    if (!uploadButton) return;
    uploadButton.disabled = true;
    uploadButton.textContent = label;
  }

  function clearLoading() {
    if (!uploadButton) return;
    uploadButton.disabled = false;
    uploadButton.textContent = "Upload your papers";
  }

  async function handleSample() {
    errorMessage.textContent = "";
    setLoading("Analyzing sample...");

    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: SAMPLE_TEXT, jurisdiction: "CA" }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze sample");
      }

      renderObligations(data.obligations || []);
    } catch (err) {
      console.error(err);
      errorMessage.textContent = err.message || "Something went wrong while analyzing the sample.";
    } finally {
      clearLoading();
    }
  }

  async function handleDocumentChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    errorMessage.textContent = "";
    setLoading("Reading document...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jurisdiction", "CA");

    try {
      const response = await fetch("/api/parse-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to read document");
      }

      renderObligations(data.obligations || []);
    } catch (err) {
      console.error(err);
      errorMessage.textContent = err.message || "Something went wrong while reading the document.";
    } finally {
      clearLoading();
      if (documentInput) {
        documentInput.value = "";
      }
    }
  }

  function renderObligations(obligations) {
    if (!obligations || obligations.length === 0) {
      obligationsList.innerHTML = "<li class=\"empty-state\">No clear obligations found. Try rephrasing or adding more detail.</li>";
      summaryOutput.innerHTML = "";
      return;
    }

    obligationsList.innerHTML = obligations
      .map((ob) => {
        let details = "";
        if (ob.frequency) details += `<p class="obligation-meta"><strong>Frequency:</strong> ${ob.frequency}</p>`;
        if (ob.limit) details += `<p class="obligation-meta"><strong>Travel limit:</strong> ${ob.limit} miles</p>`;
        if (ob.explanation) details += `<div class="explanation">${ob.explanation}</div>`;

        return `
          <li class="obligation obligation--${ob.type}">
            <div class="obligation-header">
              <span class="badge">${formatType(ob.type)}</span>
            </div>
            <p class="original-text">${ob.originalText}</p>
            ${details}
          </li>
        `;
      })
      .join("");

    summaryOutput.innerHTML = `
      <p class="summary-line">Found <strong>${obligations.length}</strong> distinct obligations.</p>
      <p class="summary-line summary-disclaimer">This is not legal advice. Always confirm with your officer or lawyer.</p>
    `;
  }

  function formatType(type) {
    if (!type) return "Other";
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  if (uploadButton && documentInput) {
    uploadButton.addEventListener("click", () => documentInput.click());
    documentInput.addEventListener("change", handleDocumentChange);
  }

  if (sampleButton) {
    sampleButton.addEventListener("click", handleSample);
  }
});
