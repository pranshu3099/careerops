  export const passwordRules = [
    { id: 1, text: "At least 8 characters long", test: (pwd) => pwd.length >= 8 },
    { id: 2, text: "Contains uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
    { id: 3, text: "Contains lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
    { id: 4, text: "Contains a number", test: (pwd) => /\d/.test(pwd) },
    { id: 5, text: "Contains special character (@$!%*?&)", test: (pwd) => /[@$!%*?&]/.test(pwd) },
  ];

  export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  export const nameRegex = /^[a-zA-Z\s]{2,}$/;
