export * from './OrbitDbContext'

// To get all store entries:

// console.log('All entries:\n',
//   db.iterator({ limit: -1 })
//     .collect()
//     .map((e) => e.payload.value))