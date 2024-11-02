const {createClient} = require('@supabase/supabase-js')
const {SUPABASE_STORAGE_URL, SUPABASE_BASE_URL, SUPABASE_NON_PUBLIC_KEY} = require('../env')

const supabase = createClient(SUPABASE_BASE_URL,SUPABASE_NON_PUBLIC_KEY)

const BytescaleUtil = {
  async Upload(file, storage_path) {
    console.log(file);
    
    const { data, error } = await supabase
    .storage
    .from('hung_bid')
    .upload(
      `${storage_path}/${new Date().getTime()}`, file.buffer, {
      cacheControl: '3600',
      contentType: file.mimetype,
      upsert: false
    })
    console.log(data);
    
    if(error){
      console.log('BytescaleUtit', error); 
    }
    return { file_url: SUPABASE_STORAGE_URL+data?.fullPath, file_path: data?.path };
  },
  Delete(storage_path_arr) {
    supabase
    .storage
    .from('hung_bid')
    .remove(storage_path_arr)
    .then((data, error) => {
      console.log("Delete file");
      console.log(data ?? error);
    })

  },
};

module.exports = BytescaleUtil;