"use client";

/**
 * Registration Form
 *
 * New user registration with email, password, and company details
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterForm() {
  const router = useRouter();

  // Convert number to Czech word
  const numberToCzech = (num) => {
    const czechNumbers = {
      1: "jedna",
      2: "dva",
      3: "tři",
      4: "čtyři",
      5: "pět",
      6: "šest",
      7: "sedm",
      8: "osm",
      9: "devět",
      10: "deset",
    };
    return czechNumbers[num] || num.toString();
  };

  // Generate random math question on component mount
  const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 8) + 3; // 3-10
    const num2 = Math.floor(Math.random() * 8) + 3; // 3-10
    return { num1, num2, answer: num1 + num2 };
  };

  const [mathQuestion] = useState(() => generateMathQuestion());

  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    company_id: "",
    password: "",
    password_confirm: "",
    my_name: "", // Honeypot field
    math_answer: "", // Math question answer
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Anti-bot validation: Check honeypot field
    if (formData.my_name && formData.my_name.trim() !== "") {
      // Bot detected - fake positive
      setError("");
      setIsLoading(false);

      // Show fake success message
      setSuccessMessage(
        "Registrace proběhla úspěšně. Zkontrolujte svůj email pro aktivaci účtu."
      );

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      return;
    }

    // Anti-bot validation: Check math answer
    const userAnswer = parseInt(formData.math_answer, 10);
    if (isNaN(userAnswer) || userAnswer !== mathQuestion.answer) {
      // Bot detected - fake positive
      setError("");
      setIsLoading(false);

      // Show fake success message
      setSuccessMessage(
        "Registrace proběhla úspěšně. Zkontrolujte svůj email pro aktivaci účtu."
      );

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.password_confirm) {
      setError("Hesla se neshodují");
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError("Heslo musí mít alespoň 8 znaků");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          contact_email: formData.contact_email,
          company_id: formData.company_id,
          password: formData.password,
          password_confirm: formData.password_confirm,
          my_name: formData.my_name, // Send honeypot to server
          math_answer: formData.math_answer, // Send math answer to server
          math_num1: mathQuestion.num1, // Send math question numbers for server validation
          math_num2: mathQuestion.num2,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Chyba při registraci");
        setIsLoading(false);
        return;
      }

      // Registration successful - show success message instead of redirecting
      // User needs to verify email first
      setError(""); // Clear any errors
      setIsLoading(false);

      // Show success state
      setFormData({
        name: "",
        contact_email: "",
        company_id: "",
        password: "",
        password_confirm: "",
        my_name: "",
        math_answer: "",
      });

      // Store success message to show
      setSuccessMessage(
        result.message ||
          "Registrace proběhla úspěšně. Zkontrolujte svůj email pro aktivaci účtu."
      );
    } catch (err) {
      console.error("Registration error:", err);
      setError("Neočekávaná chyba při registraci");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">
            Registrace
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Vytvořte si nový účet a začněte fakturovat.
          </p>
        </div>

        {successMessage ? (
          <div className="mt-8 space-y-6">
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-green-800">
                    Registrace úspěšná!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{successMessage}</p>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-green-700">
                      <p className="font-medium mb-2">Co dál?</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Zkontrolujte svou emailovou schránku</li>
                        <li>Klikněte na odkaz v emailu pro aktivaci účtu</li>
                        <li>Po aktivaci se můžete přihlásit</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <Link
                      href="/resend-verification"
                      className="text-sm font-medium text-green-800 hover:text-green-900 underline"
                    >
                      Znovu poslat aktivační email
                    </Link>
                    <span className="text-sm text-green-600">•</span>
                    <Link
                      href="/login"
                      className="text-sm font-medium text-green-800 hover:text-green-900 underline"
                    >
                      Přihlásit se
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Jméno / Název firmy *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Jan Novák / Moje firma s.r.o."
                />
              </div>

              <div>
                <label
                  htmlFor="contact_email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email *
                </label>
                <input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  required
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="vas@email.cz"
                />
              </div>

              <div>
                <label
                  htmlFor="company_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  IČO (volitelné)
                </label>
                <input
                  id="company_id"
                  name="company_id"
                  type="text"
                  value={formData.company_id}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="12345678"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Heslo *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimálně 8 znaků
                </p>
              </div>

              <div>
                <label
                  htmlFor="password_confirm"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Potvrzení hesla *
                </label>
                <input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  required
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>

              {/* Honeypot field - hidden from users, visible to bots */}
              <input
                type="text"
                name="my_name"
                tabIndex="-1"
                autoComplete="off"
                value={formData.my_name}
                onChange={handleChange}
                style={{ display: "none" }}
                aria-hidden="true"
              />

              {/* Math question - anti-bot protection */}
              <div>
                <label
                  htmlFor="math_answer"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kolik je {numberToCzech(mathQuestion.num1)} +{" "}
                  {numberToCzech(mathQuestion.num2)}? *
                </label>
                <input
                  id="math_answer"
                  name="math_answer"
                  type="text"
                  required
                  value={formData.math_answer}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Odpověď"
                  inputMode="numeric"
                />
              <p className="mt-1 text-xs text-gray-500">
                Ochrana proti robotům – zadejte výsledek.
              </p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Registrace..." : "Zaregistrovat se"}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Již máte účet?{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Přihlaste se
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
