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
  let error = null;

  // Pagination
  let currentPage = 1;
  const itemsPerPage = 5;

  // Modal state
  let showDeleteModal = false;
  let formToDelete = null;

  // Fetch all forms
  async function fetchForms() {
    try {
      const response = await axios.get("http://localhost:8000/api/forms");
      forms = response.data;
      loading = false;
    } catch (err) {
      console.error("Error fetching forms:", err);
      error = "Failed to fetch forms. Please try again later.";
      loading = false;
    }
  }

  // Open delete confirmation modal
  function openDeleteModal(form) {
    formToDelete = form;
    showDeleteModal = true;
  }

  // Close delete confirmation modal
  function closeDeleteModal() {
    showDeleteModal = false;
    formToDelete = null;
  }

  // Delete form
  async function confirmDelete() {
    if (formToDelete) {
      try {
        await axios.delete(
          `http://localhost:8000/api/forms/${formToDelete._id}`
        );
        forms = forms.filter((form) => form._id !== formToDelete._id);
        closeDeleteModal();
      } catch (err) {
        console.error("Error deleting form:", err);
        error = "Failed to delete the form. Please try again.";
        closeDeleteModal();
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

  // Paginated forms
  $: paginatedForms = filteredForms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Total pages for pagination
  $: totalPages = Math.ceil(filteredForms.length / itemsPerPage);

  onMount(fetchForms);
</script>

<svelte:head>
  <title>Template Management</title>
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300"
>
  <div class="p-6 max-w-7xl mx-auto space-y-8">
    <!-- Error Message -->
    {#if error}
      <div
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
      >
        {error}
      </div>
    {/if}

    <!-- Top Matrix Section -->
    <div
      in:fly={{ y: -20, duration: 500, delay: 200 }}
      out:fade
      class="bg-gradient-to-br from-white to-gray-100 shadow-lg rounded-lg p-6"
    >
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Template Statistics</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 overflow-hidden shadow-md rounded-lg text-white"
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
      class="bg-gradient-to-br from-gray-50 to-gray-200 rounded-lg shadow-lg p-6"
    >
      <h3 class="text-xl font-semibold mb-4 text-gray-800">
        Search and Filter
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label
            for="search"
            class="block text-sm font-medium text-gray-700 mb-1">Search</label
          >
          <input
            id="search"
            type="text"
            bind:value={searchQuery}
            placeholder="Enter template name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
        <div>
          <label for="date" class="block text-sm font-medium text-gray-700 mb-1"
            >Date</label
          >
          <input
            id="date"
            type="date"
            bind:value={selectedDate}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
        <div>
          <label
            for="status"
            class="block text-sm font-medium text-gray-700 mb-1">Status</label
          >
          <select
            id="status"
            bind:value={selectedStatus}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-2 rounded-md hover:from-indigo-700 hover:to-pink-700 transition duration-150 ease-in-out transform hover:scale-105"
        >
          Search
        </button>
      </div>
    </div>

    <!-- Template Management List -->
    <div
      in:fly={{ y: 20, duration: 500, delay: 600 }}
      out:fade
      class="bg-gradient-to-br from-white to-gray-100 rounded-lg shadow-lg"
    >
      <div
        class="p-6 flex justify-between items-center border-b border-gray-200"
      >
        <h2 class="text-2xl font-bold text-gray-800">
          Template Management List
        </h2>
        <a
          href="/form-builder"
          class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-2 rounded-md hover:from-indigo-700 hover:to-pink-700 transition duration-150 ease-in-out transform hover:scale-105 flex items-center gap-2"
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
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >SL No</th
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
              {#each paginatedForms as form, i (form._id)}
                <tr
                  transition:fade={{ duration: 150 }}
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >{i + 1 + (currentPage - 1) * itemsPerPage}</td
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
                      class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full {form.status ===
                      'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'}"
                    >
                      {form.status}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex gap-2">
                      <a
                        href={`/form-editor/${form._id}`}
                        class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-3 py-1 rounded text-sm hover:from-indigo-700 hover:to-pink-700"
                      >
                        View/Edit
                      </a>
                      <button
                        on:click={() => openDeleteModal(form)}
                        class="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded text-sm hover:from-red-600 hover:to-red-700"
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

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4 p-6">
          <button
            on:click={() => currentPage--}
            disabled={currentPage === 1}
            class="bg-gray-200 px-4 py-2 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            on:click={() => currentPage++}
            disabled={currentPage === totalPages}
            class="bg-gray-200 px-4 py-2 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    on:click|self={closeDeleteModal}
  >
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Delete Template</h2>
      <p class="text-gray-600 mb-6">
        Are you sure you want to delete the template <strong
          >{formToDelete?.formName}</strong
        >? This action cannot be undone.
      </p>
      <div class="flex justify-end gap-4">
        <button
          on:click={closeDeleteModal}
          class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-150"
        >
          Cancel
        </button>
        <button
          on:click={confirmDelete}
          class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-150"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
{/if}
