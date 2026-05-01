// src/utils/api.ts

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers: any = {
    ...(options.headers || {}),
  };

  if (
    options.body != null &&
    !(options.body instanceof FormData) &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  if (!headers["Accept"]) {
    headers["Accept"] = "application/json";
  }

  // Add authentication token if available
  const token = localStorage.getItem("userToken");
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API error: ${response.status}`;

    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export async function postBackendLogin(
  apiBase: string,
  payload: Record<string, string>,
): Promise<Response> {
  const url = `${apiBase}/api/auth/login`;

  const parseError = async (response: Response) => {
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      return json.detail || text;
    } catch {
      return text;
    }
  };

  const jsonResponse = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (jsonResponse.ok) {
    return jsonResponse;
  }

  const jsonError = (await parseError(jsonResponse)).toString().toLowerCase();
  const shouldRetryWithForm =
    [400, 422].includes(jsonResponse.status) &&
    /invalid request payload|request payload|field required|422/.test(
      jsonError,
    );

  if (shouldRetryWithForm) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const formResponse = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (formResponse.ok) {
      return formResponse;
    }

    const formError = await parseError(formResponse);
    throw new Error(formError || "Backend login failed");
  }

  throw new Error(jsonError || "Backend login failed");
}
