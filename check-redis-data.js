// Quick diagnostic script to check Redis data
const https = require('https');

const checkData = async () => {
  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.get('https://prompt.cmgfinancial.ai/api/configs', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
      });
      req.on('error', reject);
    });

    console.log('\n📊 Production Data Analysis:\n');
    console.log('Status:', response.status);
    console.log('Configs Count:', response.data.configs?.length || 0);

    if (response.data.configs) {
      response.data.configs.forEach((config, i) => {
        console.log(`\n${i + 1}. ${config.emoji} ${config.name}`);
        console.log(`   - Has systemPrompt: ${!!config.systemPrompt}`);
        console.log(`   - systemPrompt length: ${config.systemPrompt?.length || 0} chars`);
        console.log(`   - isPublished: ${config.isPublished || false}`);
        console.log(`   - slug: ${config.slug || 'none'}`);
        console.log(`   - publishedUrl: ${config.publishedUrl || 'none'}`);
      });
    }

    console.log('\n🔍 Analysis:');
    const withoutPrompts = response.data.configs?.filter(c => !c.systemPrompt).length || 0;
    const withPrompts = response.data.configs?.filter(c => c.systemPrompt).length || 0;
    const published = response.data.configs?.filter(c => c.isPublished).length || 0;

    console.log(`✅ Personalities with prompts: ${withPrompts}`);
    console.log(`❌ Personalities without prompts: ${withoutPrompts}`);
    console.log(`📢 Published personalities: ${published}`);

    if (withoutPrompts > 0) {
      console.log('\n⚠️  WARNING: Personalities without prompts will NOT show the publish toggle!');
      console.log('   Solution: Click "💾 Save & Generate" button to generate prompts');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

checkData();
