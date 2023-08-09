import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';
import { Formik } from 'formik';
import { login } from 'src/services/auth';
import { error, success } from 'src/utils/toast';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);


  const handleClick = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <><Formik
    initialValues={{ email: '', password: '' }}
    validate={(values) => {
      const errors = {};
      if (!values.email) {
        errors.email = 'Required';
      }
      if (!values.password) {
        errors.password = 'Required';
      }
      return errors;
    }}
    onSubmit={async (values) => {
      setSubmitting(true);
      login(values)
        .then(() => {
          setSubmitting(false);
          success("Logged in successfully");
          setTimeout(()=>{
            navigate("/dashboard");
          }, 1000)
        })
        .catch((e) => {
          setSubmitting(false);
          error(e?.response?.data?.message || "Login failed");
        });
    }}
  >
    {({
      values,
      errors,
      touched,
      handleChange,
      handleBlur,
      handleSubmit,
      /* and other goodies */
    }) => (
      <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField name="email" label="Email address" 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                />
              {errors.email && touched.email && errors.email}

        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.password}
        />
      {errors.password && touched.password && errors.password}
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Checkbox name="remember" label="Remember me" />
        <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained">
        Login
      </LoadingButton></form>
          )}
        </Formik>
    </>
  );
}
