export type RegisterValues = {
  userName: string;
  email: string;
  fullName: string;
  companyName: string;
  mobileNumber: string;
  address: string;
  password: string;
  confirmPassword: string;
};

export type RegisterErrors = Partial<Record<keyof RegisterValues | 'photo', string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]{2,23}$/;

function digitsOnlyMobile(value: string) {
  return value.trim().replace(/[\s-]/g, '').replace(/^\+?91/, '');
}

export function validateUsername(value: string) {
  const username = value.trim();
  if (!username) return 'Username is required';
  if (!USERNAME_PATTERN.test(username)) {
    return 'Use 3–24 characters, start with a letter, then letters, numbers, or _';
  }
  return '';
}

export function validateEmail(value: string) {
  const email = value.trim();
  if (!email) return 'Email is required';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address';
  return '';
}

export function validatePersonName(value: string, label: string) {
  const name = value.trim();
  if (!name) return `${label} is required`;
  if (name.length < 2) return `${label} must be at least 2 characters`;
  return '';
}

export function validateMobile(value: string, required: boolean) {
  const mobile = digitsOnlyMobile(value);
  if (!mobile) return required ? 'Mobile number is required' : '';
  if (!/^[6-9]\d{9}$/.test(mobile)) return 'Enter a 10-digit mobile number';
  return '';
}

export function validatePassword(value: string) {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Use at least one letter and one number';
  }
  return '';
}

export function validateConfirmPassword(password: string, confirm: string) {
  if (!confirm) return 'Confirm your password';
  if (confirm !== password) return 'Passwords do not match';
  return '';
}

export function validateImageFile(file: File | null, required: boolean, maxMb = 5) {
  if (!file) return required ? 'A photo is required' : '';
  if (!file.type.startsWith('image/')) return 'Choose a PNG or JPG image';
  if (file.size > maxMb * 1024 * 1024) return `Image must be under ${maxMb} MB`;
  return '';
}

export function validateRegisterForm(
  values: RegisterValues,
  options: { operator: boolean; photo: File | null }
): RegisterErrors {
  const errors: RegisterErrors = {};
  const username = validateUsername(values.userName);
  const email = validateEmail(values.email);
  const name = options.operator
    ? validatePersonName(values.companyName, 'Venue name')
    : validatePersonName(values.fullName, 'Full name');
  const mobile = validateMobile(values.mobileNumber, options.operator);
  const password = validatePassword(values.password);
  const confirmPassword = validateConfirmPassword(values.password, values.confirmPassword);
  const photo = validateImageFile(options.photo, options.operator);

  if (username) errors.userName = username;
  if (email) errors.email = email;
  if (name) {
    if (options.operator) errors.companyName = name;
    else errors.fullName = name;
  }
  if (mobile) errors.mobileNumber = mobile;
  if (password) errors.password = password;
  if (confirmPassword) errors.confirmPassword = confirmPassword;
  if (photo) errors.photo = photo;

  return errors;
}

export function firstRegisterError(errors: RegisterErrors) {
  const order: Array<keyof RegisterErrors> = [
    'userName',
    'fullName',
    'companyName',
    'email',
    'mobileNumber',
    'password',
    'confirmPassword',
    'photo',
  ];
  return order.find((key) => errors[key]);
}
