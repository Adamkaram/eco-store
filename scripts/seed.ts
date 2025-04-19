import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedCategories() {
  const categories = [
    { name: 'Skincare', description: 'Products for skin care and maintenance' },
    { name: 'Makeup', description: 'Cosmetic products for enhancing appearance' },
    { name: 'Haircare', description: 'Products for hair care and styling' },
    { name: 'Fragrances', description: 'Perfumes and colognes' },
    { name: 'Bath & Body', description: 'Products for bathing and body care' },
    { name: 'Nail Care', description: 'Products for nail care and decoration' },
    { name: 'Tools & Accessories', description: 'Beauty tools and accessories' },
    { name: 'Face Makeup', description: 'Products for facial makeup' },
    { name: 'Eye Makeup', description: 'Products for eye makeup' },
    { name: 'Lip Products', description: 'Lipsticks, lip glosses, and other lip products' },
    { name: 'Skincare Treatments', description: 'Specialized skincare treatments and serums' },
    { name: 'Hair Styling', description: 'Products for styling hair' },
    { name: 'Men\'s Grooming', description: 'Grooming products for men' },
    { name: 'Natural & Organic', description: 'Natural and organic beauty products' },
  ]

  const { data, error } = await supabase.from('categories').upsert(categories, { onConflict: 'name' })
  if (error) console.error('Error seeding categories:', error)
  else console.log('Categories seeded successfully')
  return data
}

async function seedUsers(count: number) {
  const users = []
  for (let i = 0; i < count; i++) {
    const email = faker.internet.email()
    const password = faker.internet.password()
    const hashedPassword = await bcrypt.hash(password, 10)
    users.push({
      email,
      encrypted_password: hashedPassword,
      user_metadata: {
        full_name: faker.person.fullName(),
      },
    })
  }

  for (const user of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.encrypted_password,
      user_metadata: user.user_metadata,
    })
    if (error) {
      console.error('Error creating user:', error)
    } else {
      console.log('Created user:', data.user.email)
    }
  }

  console.log(`Created ${users.length} users`)
}

async function seedProducts(count: number) {
  const products = [
    {
      name: 'Hydrating Serum',
      description: 'Advanced hydrating formula with hyaluronic acid',
      price: 49.99,
      stock: 100,
      category: 'Skincare',
      image_url: 'https://images.unsplash.com/photo-1570179538662-31547dbe9846?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Matte Lipstick',
      description: 'Long-lasting matte finish lipstick',
      price: 24.99,
      stock: 150,
      category: 'Makeup',
      image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Rose Perfume',
      description: 'Elegant rose fragrance with lasting notes',
      price: 89.99,
      stock: 50,
      category: 'Fragrances',
      image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    },
    // Add more products as needed
  ];

  const { data, error } = await supabase
    .from('products')
    .upsert(products);

  if (error) {
    console.error('Error seeding products:', error);
  } else {
    console.log('Products seeded successfully');
  }
}

async function seedOrders(count: number) {
  const { data: users } = await supabase.from('profiles').select('id')
  const { data: products } = await supabase.from('products').select('id, price')

  if (!users || !products) {
    console.error('No users or products found')
    return
  }

  const orders = []
  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(users)
    const orderItems = []
    const itemCount = faker.number.int({ min: 1, max: 5 })
    let totalAmount = 0

    for (let j = 0; j < itemCount; j++) {
      const product = faker.helpers.arrayElement(products)
      const quantity = faker.number.int({ min: 1, max: 5 })
      const price = product.price
      totalAmount += price * quantity

      orderItems.push({
        product_id: product.id,
        quantity,
        price,
      })
    }

    const order = {
      user_id: user.id,
      status: faker.helpers.arrayElement(['pending', 'processing', 'completed', 'cancelled']),
      total_amount: totalAmount,
      created_at: faker.date.past(),
      shipping_address: faker.location.streetAddress(),
      contact_phone: faker.phone.number(),
      contact_email: faker.internet.email(),
      customer_name: faker.person.fullName(),
    }

    const { data: orderData, error: orderError } = await supabase.from('orders').insert(order).select()
    if (orderError) {
      console.error('Error creating order:', orderError)
      continue
    }

    const orderId = orderData[0].id
    for (const item of orderItems) {
      const { error: itemError } = await supabase.from('order_items').insert({
        order_id: orderId,
        ...item
      })
      if (itemError) {
        console.error('Error creating order item:', itemError)
      }
    }

    orders.push(order)
  }

  console.log(`Created ${orders.length} orders`)
}

async function seedUserSessions(count: number) {
  const { data: users } = await supabase.from('profiles').select('id')
  if (!users) {
    console.error('No users found')
    return
  }

  const sessions = []
  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(users)
    const loginTime = faker.date.past()
    const logoutTime = faker.date.between({ from: loginTime, to: new Date() })
    sessions.push({
      user_id: user.id,
      login_time: loginTime,
      logout_time: logoutTime,
      duration: (logoutTime.getTime() - loginTime.getTime()) / 1000, // duration in seconds
    })
  }

  const { data, error } = await supabase.from('user_sessions').insert(sessions)
  if (error) {
    console.error('Error creating user sessions:', error)
    return
  }

  console.log(`Created ${sessions.length} user sessions`)
}

async function seedUserActions(count: number) {
  const { data: users } = await supabase.from('profiles').select('id')
  const { data: products } = await supabase.from('products').select('id')
  if (!users || !products) {
    console.error('No users or products found')
    return
  }

  const actions = []
  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(users)
    const product = faker.helpers.arrayElement(products)
    const actionType = faker.helpers.arrayElement(['view_product', 'add_to_cart', 'remove_from_cart', 'place_order'])
    actions.push({
      user_id: user.id,
      action_type: actionType,
      action_details: { product_id: product.id },
      created_at: faker.date.recent(),
    })
  }

  const { data, error } = await supabase.from('user_actions').insert(actions)
  if (error) {
    console.error('Error creating user actions:', error)
    return
  }

  console.log(`Created ${actions.length} user actions`)
}

async function main() {
  await seedCategories()
  await seedUsers(50)
  await seedProducts(100)
  await seedOrders(200)
  await seedUserSessions(500)
  await seedUserActions(1000)
}

main().catch(console.error)

