<script>
  import { onMount } from "svelte";
  import { FormInput, Loader } from "lucide-svelte";
  import axios from "axios";
  import { fade, fly } from "svelte/transition";

  let forms = [];
  let searchQuery = "";
  let selectedDate = "";
  let selectedStatus = "";
  let loading = true;

  // Fetch all forms
  async function fetchForms() {
    try {
      const response = await axios.get("http://localhost:8000/api/forms");
      forms = response.data;
      loading = false;
    } catch (error) {
      console.error("Error fetching forms:", error);
      loading = false;
    }
  }

  // Delete form
  async function deleteForm(id) {
    if (confirm("Are you sure you want to delete this form?")) {
      try {
        await axios.delete(`http://localhost:8000/api/forms/${id}`);
        forms = forms.filter((form) => form._id !== id);
      } catch (error) {
        console.error("Error deleting form:", error);
      }
    }
  }

  // Search and filter forms
  $: filteredForms = forms.filter((form) => {
    const matchesSearch = form.formName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDate =
      !selectedDate ||
      new Date(form.createdAt).toLocaleDateString() ===
        new Date(selectedDate).toLocaleDateString();
    const matchesStatus = !selectedStatus || form.status === selectedStatus;
    return matchesSearch && matchesDate && matchesStatus;
  });

  onMount(fetchForms);
</script>

<svelte:head>
  <title>Template Management</title>
</svelte:head>

<div class="min-h-screen bg-gray-100">
  <div class="p-6 max-w-7xl mx-auto space-y-8">
    <!-- Top Matrix Section -->
    <div
      in:fly={{ y: -20, duration: 500, delay: 200 }}
      out:fade
      class="bg-white overflow-hidden shadow-lg rounded-lg p-6"
    >
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Template Statistics</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          class="bg-gradient-to-br from-indigo-500 to-indigo-600 overflow-hidden shadow-md rounded-lg text-white"
        >
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <FormInput class="h-8 w-8" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium truncate">Total Templates</dt>
                  <dd class="flex items-baseline">
                    <div class="text-3xl font-semibold">
                      {forms.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <!-- Add more statistic cards here -->
      </div>
    </div>

    <!-- Search Section -->
    <div
      in:fly={{ y: 20, duration: 500, delay: 400 }}
      out:fade
      class="bg-white rounded-lg shadow-lg p-6"
    >
      <h3 class="text-xl font-semibold mb-4 text-gray-800">
        Search and Filter
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Search</label
          >
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Enter template name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Date</label
          >
          <input
            type="date"
            bind:value={selectedDate}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Status</label
          >
          <select
            bind:value={selectedStatus}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out transform hover:scale-105"
        >
          Search
        </button>
      </div>
    </div>

    <!-- Template Management List -->
    <div
      in:fly={{ y: 20, duration: 500, delay: 600 }}
      out:fade
      class="bg-white rounded-lg shadow-lg"
    >
      <div
        class="p-6 flex justify-between items-center border-b border-gray-200"
      >
        <h2 class="text-2xl font-bold text-gray-800">
          Template Management List
        </h2>
        <a
          href="/form-builder"
          class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out transform hover:scale-105 flex items-center gap-2"
        >
          <span class="text-xl">+</span> Create a Template
        </a>
      </div>

      <!-- Table -->
      {#if loading}
        <div class="flex justify-center items-center h-64">
          <Loader class="animate-spin h-8 w-8 text-indigo-600" />
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >ProcessID</th
                >
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >Template Name</th
                >
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >Date</th
                >
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >Status</th
                >
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >Action</th
                >
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each filteredForms as form, i (form._id)}
                <tr
                  transition:fade={{ duration: 150 }}
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >{i + 1}</td
                  >
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                    >{form.formName}</td
                  >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(form.createdAt).toLocaleString()}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                    >
                      {form.status}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex gap-2">
                      <a
                        href={`/edit-form/${form._id}`}
                        class="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                      >
                        View/Edit
                      </a>
                      <button
                        on:click={() => deleteForm(form._id)}
                        class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>
</div>
