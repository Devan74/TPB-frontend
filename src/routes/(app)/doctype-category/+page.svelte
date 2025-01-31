<script>
  import { onMount } from "svelte";
  import { Plus, Edit, Trash2, Search } from "lucide-svelte";
  import { docTypeService } from "$lib/api";
  import DocTypeModal from "../../../lib/DocTypeModal.svelte";

  let docTypes = [];
  let loading = true;
  let error = null;
  let showModal = false;
  let editingDocType = null;
  let searchQuery = "";

  onMount(async () => {
    await fetchDocTypes();
  });

  async function fetchDocTypes() {
    try {
      loading = true;
      docTypes = await docTypeService.getAllDocTypes();
    } catch (err) {
      error = "Failed to fetch document types";
      console.error(err);
    } finally {
      loading = false;
    }
  }

  async function handleDelete(id) {
    if (confirm("Are you sure you want to delete this document type?")) {
      try {
        await docTypeService.deleteDocType(id);
        await fetchDocTypes();
      } catch (err) {
        error = "Failed to delete document type";
        console.error(err);
      }
    }
  }

  function handleEdit(docType) {
    editingDocType = docType;
    showModal = true;
  }

  function handleAdd() {
    editingDocType = null;
    showModal = true;
  }

  function handleModalClose() {
    showModal = false;
    editingDocType = null;
    fetchDocTypes();
  }

  $: filteredDocTypes = docTypes.filter(
    (doc) =>
      doc.DocType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.DocTypeCode.toLowerCase().includes(searchQuery.toLowerCase())
  );
</script>

<div class="container mx-auto px-4 py-8">
  <div class="bg-white rounded-lg shadow-lg">
    <div class="p-6 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">Document Types</h1>
        <button
          on:click={handleAdd}
          class="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Document Type
        </button>
      </div>

      <div class="mt-4 relative">
        <div
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
        >
          <Search size={20} class="text-gray-400" />
        </div>
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search document types..."
          class="pl-10 w-64 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    {#if loading}
      <div class="p-6 text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
        ></div>
      </div>
    {:else if error}
      <div class="p-6 text-center text-red-600">
        {error}
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >#</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Type Code</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Document Type</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Subtypes</th
              >
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Actions</th
              >
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each filteredDocTypes as docType, index (docType._id)}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap"
                  >{docType.DocTypeCode}</td
                >
                <td class="px-6 py-4">{docType.DocType}</td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-2">
                    {#each docType.DocSubType as subType}
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {subType.SubTypeCode}
                      </span>
                    {/each}
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    on:click={() => handleEdit(docType)}
                    class="text-blue-600 hover:text-blue-900 p-2"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    on:click={() => handleDelete(docType._id)}
                    class="text-red-600 hover:text-red-900 p-2 ml-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

{#if showModal}
  <DocTypeModal docType={editingDocType} on:close={handleModalClose} />
{/if}
