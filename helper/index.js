import axios from "axios";
// import Cookies from "js-cookie";
// import { deleteCookie } from "../hooks/cookies";

// ======================
// BASE URL (NEXT JS)
// ======================
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ======================
// TOKEN GETTER
// ======================
export const token = () => {
  if (typeof window === "undefined") return null;
  // return Cookies.get("usPhar");
};

// ======================
// ERROR HANDLER
// ======================
const handleError = (error) => {
  const status = error?.response?.status;

  if (status === 401 && typeof window !== "undefined") {
    // Cookies.remove("colgoToken");
    // deleteCookie("colgoToken");
    console.error("Unauthorized - token removed");
  }
};

// ======================
// GENERIC REQUEST
// ======================
export const request = async ({ method, url, cred }) => {
  try {
    return await axios({
      method,
      url: `${BASE_URL}${url}`,
      data: cred,
      headers: {
        Authorization: token(),
      },
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// ======================
// GET
// ======================
export const getRequest = async (url) => {
  try {
    return await axios.get(`${BASE_URL}${url}`, {
      headers: {
        Authorization: token(),
      },
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// ======================
// POST
// ======================
export const postRequest = async ({ url, cred }) => {
  try {
    return await axios.post(`${BASE_URL}${url}`, cred, {
      headers: {
        Authorization: token(),
      },
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// ======================
// PUT
// ======================
export const putRequest = async ({ url, cred }) => {
  try {
    return await axios.put(`${BASE_URL}${url}`, cred, {
      headers: {
        Authorization: token(),
      },
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// ======================
// PATCH
// ======================
export const patchRequest = async ({ url, cred }) => {
  try {
    return await axios.patch(`${BASE_URL}${url}`, cred, {
      headers: {
        Authorization: token(),
      },
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// ======================
// DELETE
// ======================
export const deleteRequest = async (url) => {
  try {
    return await axios.delete(`${BASE_URL}${url}`, {
      headers: {
        Authorization: token(),
      },
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
};
export const deleteRequestwithBody = async (url, cred) => {
  try {
    return await axios.delete(`${BASE_URL}${url}`, {
      headers: {
        Authorization: token(),
      },
      data: cred,
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// ======================
// NO TOKEN REQUESTS
// ======================
export const noTokenGetRequest = (url) => axios.get(`${BASE_URL}${url}`);

export const noTokenPostRequest = ({ url, cred }) =>
  axios.post(`${BASE_URL}${url}`, cred);

export const noTokenPutRequest = ({ url, cred }) =>
  axios.put(`${BASE_URL}${url}`, cred);

export const noTokenPatchRequest = ({ url, cred }) =>
  axios.patch(`${BASE_URL}${url}`, cred);

export const noTokenDeleteRequest = (url) => axios.delete(`${BASE_URL}${url}`);

// ======================
// FILE UPLOAD
// ======================
export const fileUpload = async ({ url, cred }) => {
  try {
    return await axios.post(`${BASE_URL}${url}`, cred, {
      headers: {
        Authorization: token(),
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// ======================
// FILE DOWNLOAD
// ======================
export const fileDownload = async ({ url }) => {
  try {
    return await axios.get(`${BASE_URL}${url}`, {
      responseType: "arraybuffer",
      headers: {
        Authorization: token(),
      },
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
};
