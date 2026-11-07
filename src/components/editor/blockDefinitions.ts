export interface BlockDefinition {
  id: string;
  label: string;
  category: 'Elements' | 'Form fields' | 'Widgets';
  icon: string;
  svgIcon: string;
  description: string;
  content: string;
}

export const CANVAS_BASE_CSS = `
  * {
    box-sizing: border-box;
  }
  html, body {
    margin: 0;
    padding: 24px;
    background-color: #ffffff;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  img {
    max-width: 100%;
    height: auto;
  }
  .container-box {
    max-width: 1100px;
    margin-left: auto;
    margin-right: auto;
  }
  .responsive-columns {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    width: 100%;
  }
  .col-half {
    flex: 1 1 calc(50% - 16px);
    min-width: 280px;
  }
  .col-third {
    flex: 1 1 calc(33.333% - 16px);
    min-width: 240px;
  }
  @media (max-width: 768px) {
    .responsive-columns {
      flex-direction: column !important;
    }
    .col-half, .col-third {
      width: 100% !important;
      min-width: 100% !important;
      flex: none !important;
    }
  }
  .form-card {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  .btn-primary {
    display: inline-block;
    background-color: #2563eb;
    color: #ffffff;
    font-weight: 600;
    font-size: 14px;
    padding: 10px 20px;
    border-radius: 6px;
    text-decoration: none;
    border: none;
    cursor: pointer;
    text-align: center;
  }
  .btn-primary:hover {
    background-color: #1d4ed8;
  }
`;

export const EDITOR_BLOCKS: BlockDefinition[] = [
  // 7.3 Basic Elements
  {
    id: 'heading-1',
    label: 'Heading',
    category: 'Elements',
    icon: 'Heading',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12"/><path d="M6 4v16"/><path d="M18 4v16"/></svg>',
    description: 'Large title or section heading',
    content: `<h2 style="font-size: 28px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; line-height: 1.25;">Heading Title</h2>`
  },
  {
    id: 'paragraph-text',
    label: 'Text',
    category: 'Elements',
    icon: 'Type',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
    description: 'Paragraph of readable text',
    content: `<p style="font-size: 16px; color: #475569; line-height: 1.6; margin-top: 0; margin-bottom: 16px;">This is a paragraph of text on your page. You can click to select and edit its styling, font, colors, and content.</p>`
  },
  {
    id: 'element-image',
    label: 'Image',
    category: 'Elements',
    icon: 'Image',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    description: 'Image placeholder (JPG, PNG, WebP or SVG)',
    content: `<img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80" alt="Sample picture" style="width: 100%; max-width: 680px; height: auto; border-radius: 8px; display: block; margin: 16px 0;" />`
  },
  {
    id: 'element-button',
    label: 'Button',
    category: 'Elements',
    icon: 'MousePointerClick',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 9 5 12 1.8-5.2L21 14Z"/><path d="M7.2 2.2 8 5.1"/><path d="m5.1 8-2.9-.8"/><path d="M14 4.1 12 6"/><path d="m6 12-1.9 2"/></svg>',
    description: 'Call-to-action button',
    content: `<a href="#" class="btn-primary" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; font-size: 14px; padding: 10px 20px; border-radius: 6px; text-decoration: none; cursor: pointer;">Click Here</a>`
  },
  {
    id: 'element-link',
    label: 'Link',
    category: 'Elements',
    icon: 'Link',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    description: 'Hyperlink to a URL or page',
    content: `<a href="https://example.com" style="color: #2563eb; font-weight: 500; font-size: 15px; text-decoration: underline;">Visit website link</a>`
  },
  {
    id: 'element-container',
    label: 'Container',
    category: 'Elements',
    icon: 'Box',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
    description: 'Box or card to group elements',
    content: `<div class="container-box" style="padding: 24px; margin: 16px 0; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; min-height: 100px;"><p style="color: #94a3b8; text-align: center; margin: 0; font-size: 14px;">Drop elements inside this container</p></div>`
  },
  {
    id: 'element-columns',
    label: 'Columns',
    category: 'Elements',
    icon: 'Columns2',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>',
    description: '2 responsive columns',
    content: `<div class="responsive-columns" style="display: flex; flex-wrap: wrap; gap: 16px; margin: 16px 0;"><div class="col-half" style="flex: 1 1 calc(50% - 16px); min-width: 280px; padding: 20px; border: 1px dashed #cbd5e1; border-radius: 8px; background: #ffffff;"><h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 8px 0;">Column 1</h3><p style="color: #64748b; font-size: 14px; margin: 0;">Add your content into this column.</p></div><div class="col-half" style="flex: 1 1 calc(50% - 16px); min-width: 280px; padding: 20px; border: 1px dashed #cbd5e1; border-radius: 8px; background: #ffffff;"><h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 8px 0;">Column 2</h3><p style="color: #64748b; font-size: 14px; margin: 0;">Add your content into this column.</p></div></div>`
  },
  {
    id: 'element-table',
    label: 'Table',
    category: 'Elements',
    icon: 'Table',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>',
    description: 'Data table with rows & columns',
    content: `<div style="overflow-x: auto; margin: 16px 0;"><table style="width: 100%; border-collapse: collapse; font-size: 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;"><thead><tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;"><th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #334155;">Name</th><th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #334155;">Department</th><th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #334155;">Status</th></tr></thead><tbody><tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px 16px; color: #1e293b;">Naimul Hasan</td><td style="padding: 12px 16px; color: #64748b;">CSE</td><td style="padding: 12px 16px;"><span style="color: #16a34a; font-weight: 600;">Active</span></td></tr><tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px 16px; color: #1e293b;">Tasnim Ahmed</td><td style="padding: 12px 16px; color: #64748b;">CSE</td><td style="padding: 12px 16px;"><span style="color: #2563eb; font-weight: 600;">Enrolled</span></td></tr></tbody></table></div>`
  },

  // 7.4 Form Fields (All with visible labels & Form block with Submit button)
  {
    id: 'form-container',
    label: 'Form container',
    category: 'Form fields',
    icon: 'FormInput',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 8h10"/><path d="M7 12h4"/><path d="M7 16h10"/></svg>',
    description: 'Form block with Submit button',
    content: `<form class="form-card" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 16px 0;"><h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0;">New Form</h3><div style="margin-bottom: 16px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Full Name</label><input type="text" placeholder="Enter your full name" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" /></div><button type="submit" class="btn-primary" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">Submit</button></form>`
  },
  {
    id: 'field-short-text',
    label: 'Short text',
    category: 'Form fields',
    icon: 'CaseSensitive',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 15 4-8 4 8"/><path d="M4 13h6"/><circle cx="18" cy="12" r="3"/><path d="M21 9v6"/></svg>',
    description: 'Single-line text input with visible label',
    content: `<div style="margin-bottom: 16px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Short text</label><input type="text" placeholder="Enter short text" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" /></div>`
  },
  {
    id: 'field-long-text',
    label: 'Long text',
    category: 'Form fields',
    icon: 'AlignLeft',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',
    description: 'Multi-line textarea with visible label',
    content: `<div style="margin-bottom: 16px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Long text</label><textarea rows="3" placeholder="Enter your detailed response..." style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-family: inherit;"></textarea></div>`
  },
  {
    id: 'field-email',
    label: 'Email',
    category: 'Form fields',
    icon: 'Mail',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    description: 'Email input with visible label',
    content: `<div style="margin-bottom: 16px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Email</label><input type="email" placeholder="name@portcity.edu" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" /></div>`
  },
  {
    id: 'field-number',
    label: 'Number',
    category: 'Form fields',
    icon: 'Hash',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',
    description: 'Numeric input with visible label',
    content: `<div style="margin-bottom: 16px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Number</label><input type="number" placeholder="0" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" /></div>`
  },
  {
    id: 'field-dropdown',
    label: 'Dropdown',
    category: 'Form fields',
    icon: 'ListFilter',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>',
    description: 'Selection dropdown with visible label',
    content: `<div style="margin-bottom: 16px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Dropdown</label><select style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; background-color: #ffffff;"><option value="Option 1">Option 1</option><option value="Option 2">Option 2</option><option value="Option 3">Option 3</option></select></div>`
  },
  {
    id: 'field-checkbox',
    label: 'Checkbox',
    category: 'Form fields',
    icon: 'CheckSquare',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    description: 'Checkbox with visible label',
    content: `<div style="margin-bottom: 16px; display: flex; align-items: center; gap: 10px;"><input type="checkbox" id="chk-field" style="width: 18px; height: 18px; accent-color: #2563eb;" /><label for="chk-field" style="font-size: 14px; font-weight: 600; color: #334155; margin: 0; cursor: pointer;">Checkbox option</label></div>`
  },
  {
    id: 'field-radio',
    label: 'Radio buttons',
    category: 'Form fields',
    icon: 'CircleDot',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>',
    description: 'Radio group with visible label',
    content: `<div style="margin-bottom: 16px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 8px;">Radio buttons</label><div style="display: flex; flex-direction: column; gap: 8px;"><label style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #475569; cursor: pointer;"><input type="radio" name="radio-options" value="Option A" accent-color="#2563eb" /> Choice A</label><label style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #475569; cursor: pointer;"><input type="radio" name="radio-options" value="Option B" accent-color="#2563eb" /> Choice B</label></div></div>`
  },
  {
    id: 'field-date',
    label: 'Date',
    category: 'Form fields',
    icon: 'Calendar',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
    description: 'Date picker with visible label',
    content: `<div style="margin-bottom: 16px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Date</label><input type="date" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" /></div>`
  },
  {
    id: 'field-file',
    label: 'File upload',
    category: 'Form fields',
    icon: 'UploadCloud',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>',
    description: 'File upload field with visible label',
    content: `<div style="margin-bottom: 16px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">File upload</label><input type="file" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; background-color: #f8fafc;" /></div>`
  },

  // 7.5 Ready-Made Widgets
  {
    id: 'widget-signup',
    label: 'Sign-up form',
    category: 'Widgets',
    icon: 'UserPlus',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>',
    description: 'Ready-made student event registration block',
    content: `<div style="max-width: 480px; margin: 24px auto; padding: 28px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06);"><h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">Sign up for our event</h3><p style="font-size: 14px; color: #64748b; margin: 0 0 20px 0;">Join fellow students and receive important announcements</p><div style="margin-bottom: 14px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Full Name</label><input type="text" placeholder="Your name" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" /></div><div style="margin-bottom: 14px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Email Address</label><input type="email" placeholder="you@portcity.edu" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" /></div><div style="margin-bottom: 20px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Department</label><select style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; background: #ffffff;"><option>Computer Science & Engineering</option><option>Electrical & Electronic Engineering</option><option>Business Administration</option></select></div><button type="submit" style="width: 100%; background-color: #2563eb; color: #ffffff; padding: 12px; border: none; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer;">Submit</button></div>`
  },
  {
    id: 'widget-survey',
    label: 'Survey',
    category: 'Widgets',
    icon: 'ClipboardList',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>',
    description: 'Feedback & rating questions with Submit',
    content: `<div style="max-width: 540px; margin: 24px auto; padding: 28px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06);"><h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">Student Experience Survey</h3><p style="font-size: 14px; color: #64748b; margin: 0 0 20px 0;">Help us improve student workshops and class activities</p><div style="margin-bottom: 18px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 8px;">Overall Satisfaction</label><div style="display: flex; gap: 16px;"><label style="display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer;"><input type="radio" name="survey-sat" value="5" /> Excellent</label><label style="display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer;"><input type="radio" name="survey-sat" value="4" /> Good</label><label style="display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer;"><input type="radio" name="survey-sat" value="3" /> Average</label></div></div><div style="margin-bottom: 20px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">What went well or could be improved?</label><textarea rows="3" placeholder="Share your suggestions..." style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;"></textarea></div><button type="submit" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">Submit</button></div>`
  },
  {
    id: 'widget-booking',
    label: 'Booking',
    category: 'Widgets',
    icon: 'CalendarCheck',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>',
    description: 'Appointment slot booking block',
    content: `<div style="max-width: 500px; margin: 24px auto; padding: 28px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06);"><h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">Book Lab or Office Hours</h3><p style="font-size: 14px; color: #64748b; margin: 0 0 20px 0;">Reserve time with your faculty advisor or project supervisor</p><div style="margin-bottom: 14px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Your Full Name</label><input type="text" placeholder="Student name" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" /></div><div style="margin-bottom: 14px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Preferred Date</label><input type="date" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" /></div><div style="margin-bottom: 14px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Time Slot</label><select style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; background: #ffffff;"><option>10:00 AM - 10:30 AM</option><option>11:00 AM - 11:30 AM</option><option>02:00 PM - 02:30 PM</option><option>03:30 PM - 04:00 PM</option></select></div><div style="margin-bottom: 20px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Topic or Questions</label><input type="text" placeholder="E.g. Final project review" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" /></div><button type="submit" style="width: 100%; background-color: #2563eb; color: #ffffff; padding: 12px; border: none; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer;">Submit</button></div>`
  },
  {
    id: 'widget-tracker',
    label: 'Tracker or log',
    category: 'Widgets',
    icon: 'Activity',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2"/></svg>',
    description: 'Attendance & hours log tracker block',
    content: `<div style="max-width: 540px; margin: 24px auto; padding: 28px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06);"><h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">Activity & Attendance Tracker</h3><p style="font-size: 14px; color: #64748b; margin: 0 0 20px 0;">Log your team project hours, lab sessions and attendance</p><div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;"><div style="flex: 1 1 200px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Session Date</label><input type="date" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" /></div><div style="flex: 1 1 200px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Activity Type</label><select style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; background: #ffffff;"><option>Course Lab</option><option>Thesis Work</option><option>Club Meeting</option><option>Workshop</option></select></div></div><div style="margin-bottom: 14px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Hours Spent</label><input type="number" step="0.5" placeholder="e.g. 2.5" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" /></div><div style="margin-bottom: 20px;"><label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Tasks Accomplished</label><input type="text" placeholder="What milestones did you hit?" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" /></div><button type="submit" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">Submit</button></div>`
  },
  {
    id: 'widget-research',
    label: 'Research showcase',
    category: 'Widgets',
    icon: 'GraduationCap',
    svgIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>',
    description: 'Thesis & project research showcase block',
    content: `<div style="max-width: 760px; margin: 24px auto; padding: 32px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06);"><span style="display: inline-block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #2563eb; background-color: #eff6ff; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px;">CSE Thesis Project</span><h2 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">Automated Deep Learning for Medical Imaging</h2><p style="font-size: 14px; color: #64748b; font-weight: 500; margin: 0 0 18px 0;">Authors: Naimul Hasan, CSE-322 Research Team • Port City International University</p><div style="padding: 16px 20px; background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 4px; margin-bottom: 24px;"><h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #1e293b;">Abstract</h4><p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">This paper explores real-time neural network inference for early detection of abnormalities in chest radiography, achieving 96.4% precision with zero cloud latency.</p></div><div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;"><div style="flex: 1 1 180px; padding: 16px; background-color: #f1f5f9; border-radius: 8px; text-align: center;"><div style="font-size: 24px; font-weight: 800; color: #2563eb;">96.4%</div><div style="font-size: 13px; color: #64748b; font-weight: 600;">Accuracy Rate</div></div><div style="flex: 1 1 180px; padding: 16px; background-color: #f1f5f9; border-radius: 8px; text-align: center;"><div style="font-size: 24px; font-weight: 800; color: #2563eb;">15ms</div><div style="font-size: 13px; color: #64748b; font-weight: 600;">Inference Latency</div></div><div style="flex: 1 1 180px; padding: 16px; background-color: #f1f5f9; border-radius: 8px; text-align: center;"><div style="font-size: 24px; font-weight: 800; color: #2563eb;">12,000+</div><div style="font-size: 13px; color: #64748b; font-weight: 600;">Evaluated Scans</div></div></div><a href="#" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 600; text-decoration: none;">Download Paper (PDF)</a></div>`
  }
];
