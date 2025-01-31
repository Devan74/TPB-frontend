<script>
  import { createEventDispatcher } from "svelte";
  import { X, Plus, Trash2 } from "lucide-svelte";
  import { docTypeService } from "$lib/api";

  export let docType = null;

  const dispatch = createEventDispatcher();

  $: isEditing = !!docType;

  let formData = {
    DocTypeCode: "",
    DocType: "",
    DocSubType: [],
  };

  $: if (docType) {
    formData = { ...docType };
  }

  let newSubType = { SubTypeCode: "", DocSubType: "" };
  let error = null;

  function updateDocTypeCode(value) {
    formData = { ...formData, DocTypeCode: value };
  }

  function updateDocType(value) {
    formData = { ...formData, DocType: value };
  }

  function addSubType() {
    if (newSubType.SubTypeCode && newSubType.DocSubType) {
      formData = {
        ...formData,
        DocSubType: [...formData.DocSubType, { ...newSubType }],
      };
      newSubType = { SubTypeCode: "", DocSubType: "" };
    }
  }

  function updateSubType(index, key, value) {
    formData = {
      ...formData,
      DocSubType: formData.DocSubType.map((subType, i) =>
        i === index ? { ...subType, [key]: value } : subType
      ),
    };
  }

  function removeSubType(index) {
    formData = {
      ...formData,
      DocSubType: formData.DocSubType.filter((_, i) => i !== index),
    };
  }

  async function handleSubmit() {
    try {
      if (isEditing) {
        await docTypeService.updateDocType(docType._id, formData);
      } else {
        await docTypeService.createDocType(formData);
      }
      dispatch("close");
    } catch (err) {
      error = err.response?.data?.message || "An error occurred";
      console.error(err);
    }
  }
</script>

<div
  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
>
  <div
    class="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
  >
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">
          {isEditing ? "Edit Document Type" : "Add New Document Type"}
        </h2>
        <button
          class="text-gray-500 hover:text-gray-700"
          on:click={() => dispatch("close")}
        >
          <X size={24} />
        </button>
      </div>

      {#if error}
        <div class="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1"
              for="docTypeCode"
            >
              Type Code
            </label>
            <input
              type="text"
              id="docTypeCode"
              value={formData.DocTypeCode}
              on:input={(e) => updateDocTypeCode(e.target.value)}
              class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1"
              for="docType"
            >
              Document Type
            </label>
            <input
              type="text"
              id="docType"
              value={formData.DocType}
              on:input={(e) => updateDocType(e.target.value)}
              class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div class="border-t pt-4">
          <h3 class="font-medium mb-4">Subtypes</h3>

          <div class="space-y-4">
            {#each formData.DocSubType as subType, i}
              <div class="flex gap-4 items-center">
                <div class="flex-1">
                  <input
                    type="text"
                    value={subType.SubTypeCode}
                    on:input={(e) =>
                      updateSubType(i, "SubTypeCode", e.target.value)}
                    class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Subtype Code"
                  />
                </div>
                <div class="flex-1">
                  <input
                    type="text"
                    value={subType.DocSubType}
                    on:input={(e) =>
                      updateSubType(i, "DocSubType", e.target.value)}
                    class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Subtype Name"
                  />
                </div>
                <button
                  type="button"
                  class="text-red-600 hover:text-red-800"
                  on:click={() => removeSubType(i)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            {/each}

            <div class="flex gap-4 items-end">
              <div class="flex-1">
                <label
                  class="block text-sm font-medium text-gray-700 mb-1"
                  for="newSubTypeCode"
                >
                  Subtype Code
                </label>
                <input
                  type="text"
                  id="newSubTypeCode"
                  bind:value={newSubType.SubTypeCode}
                  class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div class="flex-1">
                <label
                  class="block text-sm font-medium text-gray-700 mb-1"
                  for="newSubTypeName"
                >
                  Subtype Name
                </label>
                <input
                  type="text"
                  id="newSubTypeName"
                  bind:value={newSubType.DocSubType}
                  class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                class="bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center gap-2"
                on:click={addSubType}
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            class="px-4 py-2 border rounded-md hover:bg-gray-50"
            on:click={() => dispatch("close")}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isEditing ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
