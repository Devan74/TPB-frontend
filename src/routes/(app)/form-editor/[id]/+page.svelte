<script lang="ts">
  import { onMount } from 'svelte';
  import axios from 'axios';
  import { Loader, Trash } from 'lucide-svelte';
  import { toasts } from "svelte-toasts";
  import { goto } from "$app/navigation";

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
      loading = false;
    } catch (err) {
      error = `Error loading form: ${err.message}`;
      loading = false;
    }
  });

  // Toggle form status and update backend
  const toggleFormStatus = async () => {
    if (!form) return;

    form.status = form.status === "active" ? "inactive" : "active"; // Toggle state

    try {
      await axios.put(`http://localhost:8000/api/forms/${data.id}`, {
        status: form.status,
      });
    } catch (err) {
      alert('Error updating form status: ' + err.message);
    }
  };

  // Save form data including edited labels, deleted fields, and status updates
  const saveForm = async () => {
    try {
      await axios.put(`http://localhost:8000/api/forms/${data.id}`, {
        formName: form.formName,
        fields: form.fields, 
        status: form.status
      });

      toasts.add({
        title: "Success",
        description: "Form updated successfully",
        duration: 3000,
        placement: "top-center",
        type: "success",
        theme: "dark",
      });

      goto("/template-management");
    } catch (err) {
      alert('Error saving form: ' + err.message);
    }
  };

  const deleteField = (fieldId) => {
  form.fields = form.fields.filter(field => field._id !== fieldId);
  };

</script>

<!-- UI Section -->
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
        <input
          type="text"
          bind:value={form.formName}
          class="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none mb-4"
        />

        <!-- Form Status Toggle Button -->
        <div class="mb-4">
          <span class="ml-2">Form Status: </span>
          <button
            class={`px-4 py-2 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              form.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            on:click={toggleFormStatus}
          >
            {form.status === 'active' ? 'Active' : 'Inactive'}
          </button>
        </div>

        <form class="space-y-6">
          {#each form.fields as field (field._id)}
            <div class="border p-4 rounded-lg shadow-sm bg-gray-50 relative">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <input
                  type="text"
                  bind:value={field.properties.label}
                  class=" px-2 py-1 border border-gray-300 rounded-md focus:outline-none"
                />
              </label>

              {#if field.type === 'input'}
                <input
                  id={field.properties.name}
                  bind:value={formValues[field.properties.name]}
                  placeholder={field.attributes?.placeholder || 'Enter value'}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                />
              {:else if field.type === 'textarea'}
                <textarea
                  id={field.properties.name}
                  bind:value={formValues[field.properties.name]}
                  placeholder={field.attributes?.placeholder || 'Enter text'}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
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

              <!-- Delete Button -->
              <button type="button" on:click={() => deleteField(field._id)}
                class="absolute top-2 right-2 text-red-600 hover:text-red-800">
                <Trash class="w-5 h-5" />
              </button>
            </div>
          {/each}

          <!-- Save Button -->
          <button type="button" on:click={saveForm}
            class="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Save Changes
          </button>
        </form>
      </div>
    {/if}
  </div>
</div>
