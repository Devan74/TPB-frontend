<script>
  import { onMount } from "svelte";
  import axios from "axios";
  import { toasts } from "svelte-toasts";
  import { goto } from "$app/navigation";
  import { Trash } from "lucide-svelte";

  export let data;

  let form = null;
  let loading = true;
  let error = null;
  let formValues = {};
  let fieldToDelete = null;
  let showStatusModal = false;

  const api = axios.create({ baseURL: "http://localhost:8000/api" });

  const handleError = (err, message) => {
    toasts.add({
      title: "Error",
      description: `${message}: ${err.message}`,
      duration: 3000,
      placement: "top-center",
      type: "error",
      theme: "dark",
    });
  };

  onMount(async () => {
    try {
      if (!data.id) throw new Error("Form ID is undefined");
      form = await fetchForm(data.id);
      loading = false;
    } catch (err) {
      error = `Error loading form: ${err.message}`;
      loading = false;
    }
  });

  const fetchForm = async (id) => {
    try {
      const response = await api.get(`/forms/${id}`);
      return response.data;
    } catch (err) {
      handleError(err, "Failed to fetch form");
      return null;
    }
  };

  const toggleFormStatus = async () => {
    if (!form) return;
    showStatusModal = true;
  };

  const confirmToggleStatus = async () => {
    if (!form) return;
    form.status = form.status === "active" ? "inactive" : "active";
    try {
      await api.put(`/forms/${data.id}`, { status: form.status });
      showStatusModal = false;
    } catch (err) {
      handleError(err, "Error updating form status");
    }
  };

  const saveForm = async () => {
    try {
      await api.put(`/forms/${data.id}`, {
        formName: form.formName,
        fields: form.fields,
        status: form.status,
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
      handleError(err, "Error saving form");
    }
  };

  const deleteField = (fieldId) => {
    form.fields = form.fields.filter((field) => field._id !== fieldId);
  };
</script>

<!-- UI Section -->
<div class="min-h-screen bg-gray-100 p-6">
  <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
    {#if loading}
      <div class="space-y-4">
        {#each [1, 2, 3] as _}
          <div class="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
        {/each}
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
              form.status === "active"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            on:click={toggleFormStatus}
          >
            {form.status === "active" ? "Active" : "Inactive"}
          </button>
        </div>

        {#if showStatusModal}
          <div
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <div class="bg-white p-6 rounded-lg">
              <p>Are you sure you want to change the form status?</p>
              <div class="flex justify-end mt-4">
                <button on:click={() => (showStatusModal = false)} class="mr-2"
                  >Cancel</button
                >
                <button
                  on:click={confirmToggleStatus}
                  class="bg-red-500 text-white px-4 py-2 rounded"
                  >Confirm</button
                >
              </div>
            </div>
          </div>
        {/if}

        <form class="space-y-6">
          {#each form.fields as field (field._id)}
            <div class="border p-4 rounded-lg shadow-sm bg-gray-50 relative">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <input
                  type="text"
                  bind:value={field.properties.label}
                  class="px-2 py-1 border border-gray-300 rounded-md focus:outline-none"
                />
              </label>

              {#if field.type === "input"}
                <input
                  id={field.properties.name}
                  bind:value={formValues[field.properties.name]}
                  placeholder={field.attributes?.placeholder || "Enter value"}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                />
              {:else if field.type === "textarea"}
                <textarea
                  id={field.properties.name}
                  bind:value={formValues[field.properties.name]}
                  placeholder={field.attributes?.placeholder || "Enter text"}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                ></textarea>
              {:else if field.type === "radio"}
                <div
                  class={field.layout?.inline ? "flex space-x-4" : "space-y-2"}
                >
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
              {:else if field.type === "checkbox"}
                <div
                  class={field.layout?.inline ? "flex space-x-4" : "space-y-2"}
                >
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
              <button
                type="button"
                on:click={() => (fieldToDelete = field._id)}
                class="absolute top-2 right-2 text-red-600 hover:text-red-800"
              >
                <Trash class="w-5 h-5" />
              </button>
            </div>
          {/each}

          {#if fieldToDelete}
            <div
              class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <div class="bg-white p-6 rounded-lg">
                <p>Are you sure you want to delete this field?</p>
                <div class="flex justify-end mt-4">
                  <button on:click={() => (fieldToDelete = null)} class="mr-2"
                    >Cancel</button
                  >
                  <button
                    on:click={() => {
                      deleteField(fieldToDelete);
                      fieldToDelete = null;
                    }}
                    class="bg-red-500 text-white px-4 py-2 rounded"
                    >Delete</button
                  >
                </div>
              </div>
            </div>
          {/if}

          <!-- Save Button -->
          <button
            type="button"
            on:click={saveForm}
            class="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    {/if}
  </div>
</div>
