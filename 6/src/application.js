import keyBy from 'lodash/keyBy.js';
import has from 'lodash/has.js';
import isEmpty from 'lodash/isEmpty.js';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';

const routes = {
  usersPath: () => '/users',
};

const schema = yup.object().shape({
  name: yup.string().trim().required(),
  email: yup.string().required('email must be a valid email').email(),
  password: yup.string().required().min(6),
  passwordConfirmation: yup.string()
    .required('password confirmation is a required field')
    .oneOf(
      [yup.ref('password'), null],
      'password confirmation does not match to password',
    ),
});

// Этот объект можно использовать для того, чтобы обрабатывать ошибки сети.
// Это необязательное задание, но крайне рекомендуем попрактиковаться.
const errorMessages = {
  network: {
    error: 'Network Problems. Try again.',
  },
};

// Используйте эту функцию для выполнения валидации.
// Выведите в консоль её результат, чтобы увидеть, как получить сообщения об ошибках.
const validate = (fields) => {
  try {
    schema.validateSync(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return keyBy(e.inner, 'path');
  }
};

// BEGIN
export default () => {
  const container = document.querySelector('[data-container="sign-up"]');
  const form = container.querySelector('[data-form="sign-up"]');
  const submitButton = form.querySelector('input[type="submit"]');
  
  const initialState = {
    form: {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    },
    errors: {},
    isValid: false,
    processState: 'filling',
  };

  const watchedState = onChange(initialState, (path, value, previousValue) => {
    if (path === 'form') {
      const errors = validate(watchedState.form);
      watchedState.errors = errors;
      watchedState.isValid = isEmpty(errors);
    }

    if (path === 'errors' || path === 'isValid') {
      renderForm(form, watchedState);
    }

    if (path === 'processState') {
      switch (value) {
        case 'processing':
          submitButton.disabled = true;
          break;
        case 'finished':
          container.innerHTML = 'User Created!';
          break;
        case 'error':
          submitButton.disabled = false;
          break;
        case 'filling':
          submitButton.disabled = !watchedState.isValid;
          break;
        default:
          throw new Error(`Unknown process state: ${value}`);
      }
    }
  });

  const renderForm = (formElement, state) => {
    const formElements = Array.from(formElement.elements).filter(el => el.name);

    formElements.forEach(element => {
      const errorKey = element.name;
      const error = state.errors[errorKey];

      if (error) {
        element.classList.add('is-invalid');
        let feedbackElement = element.nextElementSibling;

        if (!feedbackElement || !feedbackElement.classList.contains('invalid-feedback')) {
          feedbackElement = document.createElement('div');
          feedbackElement.classList.add('invalid-feedback');
          element.after(feedbackElement);
        }
        feedbackElement.textContent = error.message;
      } else {
        element.classList.remove('is-invalid');
        let feedbackElement = element.nextElementSibling;
        if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
          feedbackElement.remove();
        }
      }
    });
    submitButton.disabled = !state.isValid || watchedState.processState === 'processing';
  };
  form.addEventListener('input', (e) => {
    const { target } = e;
    watchedState.form = {
      ...watchedState.form,
      [target.name]: target.value,
    };
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.processState = 'processing';

    axios.post(routes.usersPath(), watchedState.form)
      .then(() => {
        watchedState.processState = 'finished';
      })
      .catch((err) => {
        console.error('Submission error:', err);

        let errorMessage = errorMessages.network.error;
        if (err.response && err.response.status === 409) {
          errorMessage = 'This email is already registered';
        }
        watchedState.processState = 'error';
      });
  });
  renderForm(form, watchedState);
};
// END
