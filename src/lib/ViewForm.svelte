<script lang="ts">
    import { onMount } from 'svelte';
    import * as yup from 'yup';
    import { fade } from 'svelte/transition';
  
    export let data: { id: string };
    
    // console.log('Received data:', data);
  
    let form: any = null;
    let loading = true;
    let error: string | null = null;
    let formErrors: Record<string, string> = {};
    let formValues: Record<string, any> = {};
  
    // Fetch form from backend
    onMount(async () => {
      try {
        if (!data.id) {
          throw new Error('Form ID is undefined');
        }
        const response = await fetch(`http://localhost:8000/api/forms/${data.id}`);
        if (!response.ok) throw new Error('Failed to fetch form');
        form = await response.json();
        form.fields.forEach((field: any) => {
          formValues[field.properties.name] = field.type === 'checkbox' ? [] : '';
        });
  
        loading = false;
      } catch (err) {
        error = `Error loading form: ${err.message}`;
        loading = false;
      }
    });
  
    // Yup schema
    function getValidationSchema() {
      let schema: Record<string, any> = {};
      form.fields.forEach((field: any) => {
        let fieldSchema: any = yup.string();
  
        if (field.validation?.required) {
          fieldSchema = fieldSchema.required(`${field.properties.label} is required`);
        }
        if (field.validation?.minLength) {
          fieldSchema = fieldSchema.min(field.validation.minLength, `${field.properties.label} must be at least ${field.validation.minLength} characters`);
        }
        if (field.validation?.maxLength) {
          fieldSchema = fieldSchema.max(field.validation.maxLength, `${field.properties.label} must be at most ${field.validation.maxLength} characters`);
        }
        if (field.validation?.min) {
          fieldSchema = fieldSchema.min(field.validation.min, `${field.properties.label} must be at least ${field.validation.min}`);
        }
        if (field.validation?.max) {
          fieldSchema = fieldSchema.max(field.validation.max, `${field.properties.label} must be at most ${field.validation.max}`);
        }
        if (field.validation?.pattern) {
          fieldSchema = fieldSchema.matches(new RegExp(field.validation.pattern), `${field.properties.label} is not in the correct format`);
        }
  
        if (field.type === 'checkbox') {
          fieldSchema = yup.array().of(yup.string());
          if (field.validation?.required) {
            fieldSchema = fieldSchema.min(1, `${field.properties.label} is required`);
          }
        }
  
        schema[field.properties.name] = fieldSchema;
      });
  
      return yup.object().shape(schema);
    }
  
    // form submission
    async function submitForm() {
      try {
        const schema = getValidationSchema();
        await schema.validate(formValues, { abortEarly: false });
        const response = await fetch(`/api/forms/${data.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formValues),
        });
  
        if (!response.ok) throw new Error('Failed to submit form');
  
        alert('Form submitted successfully!');
        formErrors = {};
      } catch (err) {
        if (err instanceof yup.ValidationError) {
          let errors: Record<string, string> = {};
          err.inner.forEach((e) => {
            if (e.path) errors[e.path] = e.message;
          });
          formErrors = errors;
        } else {
          console.error('Error submitting form:', err);
          alert('An error occurred while submitting the form. Please try again.');
        }
      }
    }
  </script>
  
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {#if loading}
        <p class="text-center text-gray-600">Loading form...</p>
      {:else if error}
        <p class="text-center text-red-500">{error}</p>
      {:else if form}
        <div in:fade={{ duration: 300 }}>
          <h1 class="text-3xl font-bold mb-6 text-center">{form.formName}</h1>
  
          <form on:submit|preventDefault={submitForm} class="space-y-6">
            {#each form.fields as field (field._id)}
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1" for={field.properties.name}>
                  {field.properties.label}
                  {#if field.validation?.required}
                    <span class="text-red-500">*</span>
                  {/if}
                </label>
  
                {#if field.type === 'input'}
                  {#if field.attributes.type === 'text'}
                    <input
                      id={field.properties.name}
                      bind:value={formValues[field.properties.name]}
                      type="text"
                      placeholder={field.attributes.placeholder}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  {:else if field.attributes.type === 'email'}
                    <input
                      id={field.properties.name}
                      bind:value={formValues[field.properties.name]}
                      type="email"
                      placeholder={field.attributes.placeholder}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  {:else if field.attributes.type === 'number'}
                    <input
                      id={field.properties.name}
                      bind:value={formValues[field.properties.name]}
                      type="number"
                      placeholder={field.attributes.placeholder}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  {/if}
                {:else if field.type === 'textarea'}
                  <textarea
                    id={field.properties.name}
                    bind:value={formValues[field.properties.name]}
                    placeholder={field.attributes.placeholder}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                {:else if field.type === 'radio'}
                  <div class={field.layout?.inline ? 'flex space-x-4' : 'space-y-2'}>
                    {#each field.options as option}
                      <label class="inline-flex items-center">
                        <input
                          type="radio"
                          bind:group={formValues[field.properties.name]}
                          value={option.value}
                          class="form-radio text-blue-600"
                        />
                        <span class="ml-2">{option.label}</span>
                      </label>
                    {/each}
                  </div>
                {:else if field.type === 'checkbox'}
                  <div class={field.layout?.inline ? 'flex space-x-4' : 'space-y-2'}>
                    {#each field.options as option}
                      <label class="inline-flex items-center">
                        <input
                          type="checkbox"
                          bind:group={formValues[field.properties.name]}
                          value={option.value}
                          class="form-checkbox text-blue-600"
                        />
                        <span class="ml-2">{option.label}</span>
                      </label>
                    {/each}
                  </div>
                {/if}
  
                {#if formErrors[field.properties.name]}
                  <p class="mt-1 text-sm text-red-600">{formErrors[field.properties.name]}</p>
                {/if}
              </div>
            {/each}
  
            <div class="mt-8 flex justify-end">
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      {/if}
    </div>
  </div>