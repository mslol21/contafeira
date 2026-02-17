
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("Este navegador não suporta notificações desktop");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const sendLocalNotification = (title, options) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: '/icon.png',
      badge: '/icon.png',
      ...options
    });
  }
};

export const checkLowStock = (produtos) => {
  const lowStockThreshold = 5;
  const itemsWithLowStock = produtos.filter(p => p.estoque > 0 && p.estoque <= lowStockThreshold);
  
  if (itemsWithLowStock.length > 0) {
    const names = itemsWithLowStock.map(p => p.nome).join(', ');
    sendLocalNotification("Estoque Baixo!", {
      body: `Os seguintes itens estão acabando: ${names}`,
      tag: 'low-stock'
    });
  }
};
