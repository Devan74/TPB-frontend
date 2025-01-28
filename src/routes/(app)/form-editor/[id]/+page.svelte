<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import axios from 'axios';
    import { fade } from 'svelte/transition';
  
    export let data;
  
    let form = null;
    let loading = true;
    let error = null;
  
    onMount(async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/forms/${data.id}`);
        form = response.data;
        loading = false;
      } catch (err) {
        error = 'Error loading form';
        loading = false;
      }
    });
  
    async function saveForm() {
      try {
        await axios.put(`http://localhost:8000/api/forms/${data.id}`, form);
        alert('Form saved successfully!');
      } catch (err) {
        alert('Error saving form');
      }
    }
  
    function updateField(field, key, value) {
      field[key] = value;
      form = { ...form };
    }
  </script>
  
  <svelte:head>
    <title>{form ? `Edit: ${form.formName}` : 'Loading Form...'}</title>
  </svelte:head>
  
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {#if loading}
        <p>Loading form...</p>
      {:else if error}
        <p class="text-red-500">{error}</p>
      {:else if form}
        <div in:fade={{ duration: 300 }}>
          <h1 class="text-3xl font-bold mb-6">{form.formName}</h1>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Form Name</label>
            <input
              type="text"
              bind:value={form.formName}
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
  
          <h2 class="text-xl font-semibold mb-4">Fields</h2>
          {#each form.fields as field, index}
            <div class="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 class="text-lg font-medium mb-2">{field.properties.label}</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
                  <input
                    type="text"
                    bind:value={field.properties.label}
                    on:input={() => updateField(field, 'properties', { ...field.properties })}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    bind:value={field.properties.name}
                    on:input={() => updateField(field, 'properties', { ...field.properties })}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                {#if field.type === 'input' || field.type === 'textarea'}
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                    <input
                      type="text"
                      bind:value={field.attributes.placeholder}
                      on:input={() => updateField(field, 'attributes', { ...field.attributes })}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                {/if}
                {#if field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox'}
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Options</label>
                    {#each field.options as option, optionIndex}
                      <div class="flex gap-2 mb-2">
                        <input
                          type="text"
                          bind:value={option.label}
                          on:input={() => updateField(field, 'options', [...field.options])}
                          class="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Option label"
                        />
                        <input
                          type="text"
                          bind:value={option.value}
                          on:input={() => updateField(field, 'options', [...field.options])}
                          class="w-20 px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Value"
                        />
                      </div>
                    {/each}
                    <button
                      on:click={() => {
                        field.options = [...field.options, { label: '', value: '' }];
                        form = { ...form };
                      }}
                      class="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Add Option
                    </button>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
  
          <div class="mt-8 flex justify-end">
            <button
              on:click={saveForm}
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
  
  