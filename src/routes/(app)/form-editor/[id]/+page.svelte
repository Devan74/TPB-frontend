<script lang="ts">
  import { onMount } from 'svelte';
  import axios from 'axios';
  import { Loader } from 'lucide-svelte';

  export let data: { id: string };

  let form: any = null;
  let loading = true;
  let error: string | null = null;
  let formValues: Record<string, any> = {};

  // Fetch form from backend
  onMount(async () => {
    try {
      if (!data.id) {
        throw new Error('Form ID is undefined');
      }
      const response = await axios.get(`http://localhost:8000/api/forms/${data.id}`);
      if (!response.data) throw new Error('Failed to fetch form');
      form = response.data;

      form.fields.forEach((field: any) => {
        formValues[field.properties.name] = field.type === 'checkbox' ? [] : '';
      });

      loading = false;
    } catch (err) {
      error = `Error loading form: ${err.message}`;
      loading = false;
    }
  });

  // Save form data
  const saveForm = async () => {
    try {
      const response = await axios.put(`http://localhost:8000/api/forms/${data.id}`, {
        formName: form.formName,
        fields: form.fields.map((field: any) => ({
          ...field,
          properties: {
            ...field.properties,
            value: formValues[field.properties.name]
          }
        }))
      });

      if (response.data) {
        alert('Form saved successfully!');
      }
    } catch (err) {
      alert('Error saving form: ' + err.message);
    }
  };
</script>

<div class="min-h-screen bg-gray-100 p-6">
  <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
    {#if loading}
      <div class="flex justify-center items-center h-64">
        <Loader class="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    {:else if error}
      <p class="text-center text-red-500">{error}</p>
    {:else if form}
      <div>
        <h1 class="text-3xl font-bold mb-6 text-center">{form.formName}</h1>

        <form class="space-y-6">
          {#each form.fields as field (field._id)}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for={field.properties.name}>
                {field.properties.label}
                {#if field.validation?.required}
                  <span class="text-red-500">*</span>
                {/if}
              </label>

              {#if field.type === 'input'}
                <input
                  id={field.properties.name}
                  bind:value={formValues[field.properties.name]}
                  placeholder={field.attributes.placeholder}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
            </div>
          {/each}

          <button type="button" on:click={saveForm} class="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Save Changes
          </button>
        </form>
      </div>
    {/if}
  </div>
</div>
