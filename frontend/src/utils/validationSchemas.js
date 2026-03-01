import * as yup from 'yup';

export const updateStoreProfileSchema = yup.object({
    storeName: yup
        .string()
        .min(2, 'Store name must be at least 2 characters')
        .max(100, 'Store name cannot exceed 100 characters')
        .required('Store name is required'),

    ownerName: yup
        .string()
        .min(2, 'Owner name must be at least 2 characters')
        .max(100, 'Owner name cannot exceed 100 characters')
        .required('Owner name is required'),

    phone: yup
        .string()
        .matches(/^[0-9]{10}$/, 'Phone must be exactly 10 digits')
        .nullable()
        .transform((value) => value === '' ? null : value),

    address: yup
        .string()
        .max(300, 'Address cannot exceed 300 characters')
        .nullable()
        .transform((value) => value === '' ? null : value),
});

export const changePasswordSchema = yup.object({
    currentPassword: yup
        .string()
        .required('Current password is required'),

    newPassword: yup
        .string()
        .min(8, 'New password must be at least 8 characters')
        .required('New password is required'),

    confirmPassword: yup
        .string()
        .oneOf([yup.ref('newPassword')], 'Passwords do not match')
        .required('Please confirm your new password'),
});
