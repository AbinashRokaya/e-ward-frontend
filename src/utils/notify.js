import { toast } from "react-toastify";

// ---------------------------------------------------------------------------
// Extract a readable error message from different API / JavaScript errors.
//
// FastAPI can return:
//
// 1. Normal HTTPException
//    { "detail": "Invalid username or password" }
//
// 2. Validation error
//    {
//      "detail": [
//        {
//          "loc": ["body", "email"],
//          "msg": "Field required",
//          "type": "missing"
//        }
//      ]
//    }
//
// 3. JavaScript Error
//    new Error("Network request failed")
//
// The UI should never receive the raw object because React cannot render
// objects directly inside toast messages.
// ---------------------------------------------------------------------------

export function extractErrorMessage(
  err,
  fallback = "Something went wrong.",
) {
  if (!err) {
    return fallback;
  }

  const detail = err?.detail;

  // ---------------------------------------------------------
  // FastAPI validation errors
  // ---------------------------------------------------------
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item?.msg) {
          return item.msg;
        }

        return null;
      })
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join("; ");
    }
  }

  // ---------------------------------------------------------
  // FastAPI HTTPException
  // ---------------------------------------------------------
  if (typeof detail === "string" && detail.trim()) {
    return detail.trim();
  }

  // ---------------------------------------------------------
  // Object-shaped detail
  // ---------------------------------------------------------
  if (detail && typeof detail === "object") {
    if (typeof detail.message === "string" && detail.message.trim()) {
      return detail.message.trim();
    }

    if (typeof detail.msg === "string" && detail.msg.trim()) {
      return detail.msg.trim();
    }
  }

  // ---------------------------------------------------------
  // Normal JavaScript Error
  // ---------------------------------------------------------
  if (
    typeof err.message === "string" &&
    err.message.trim()
  ) {
    return err.message.trim();
  }

  // ---------------------------------------------------------
  // Direct string error
  // ---------------------------------------------------------
  if (typeof err === "string" && err.trim()) {
    return err.trim();
  }

  return fallback;
}

// ---------------------------------------------------------------------------
// Shared toast helper
//
// Keeping all toast configuration here means every page gets consistent
// durations and behaviour.
// ---------------------------------------------------------------------------

export const notify = {
  // ---------------------------------------------------------
  // Success
  // ---------------------------------------------------------
  success: (msg) => {
    toast.success(msg, {
      autoClose: 3000,
    });
  },

  // ---------------------------------------------------------
  // Error
  // ---------------------------------------------------------
  error: (msg) => {
    toast.error(msg, {
      autoClose: 6000,
    });
  },

  // ---------------------------------------------------------
  // Information
  // ---------------------------------------------------------
  info: (msg) => {
    toast.info(msg, {
      autoClose: 4000,
    });
  },

  // ---------------------------------------------------------
  // Warning
  // ---------------------------------------------------------
  warn: (msg) => {
    toast.warn(msg, {
      autoClose: 5000,
    });
  },

  // ---------------------------------------------------------
  // API error
  //
  // Use this for POST / PUT / PATCH / DELETE requests.
  //
  // Example:
  //
  // catch (err) {
  //   notify.apiError(err, "Complaint submission failed.");
  // }
  // ---------------------------------------------------------
  apiError: (
    err,
    fallback = "Something went wrong.",
  ) => {
    console.error("API Error:", err);

    toast.error(
      extractErrorMessage(err, fallback),
      {
        autoClose: 6000,
      },
    );
  },

  // ---------------------------------------------------------
  // Failed data loading
  //
  // Use this for GET requests where failure should be visible
  // to the user.
  //
  // Example:
  //
  // catch (err) {
  //   notify.loadFailed("your complaints", err);
  // }
  // ---------------------------------------------------------
  loadFailed: (
    what,
    err,
  ) => {
    console.error(`Failed to load ${what}:`, err);

    toast.error(
      extractErrorMessage(
        err,
        `Could not load ${what}. Please try again.`,
      ),
      {
        autoClose: 6000,
      },
    );
  },

  // ---------------------------------------------------------
  // First validation error
  //
  // Useful when a form has multiple validation problems.
  // Instead of showing 5 toast messages at once, show only
  // the first problem.
  //
  // Returns true when an error was displayed.
  // Returns false when there were no errors.
  // ---------------------------------------------------------
  firstError: (errors) => {
    if (!Array.isArray(errors) || errors.length === 0) {
      return false;
    }

    const firstError = errors.find(
      (error) =>
        typeof error === "string" &&
        error.trim(),
    );

    if (!firstError) {
      return false;
    }

    toast.error(firstError, {
      autoClose: 6000,
    });

    return true;
  },
};